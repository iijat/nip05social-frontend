import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {
  AdmSendDMQueryArgs,
  AdmSendDMQueryRoot,
} from 'packages/shared/src/lib/graphql/crud/adm';
import { AdmUsersQueryRoot } from 'packages/shared/src/lib/graphql/crud/user';
import { FULL_FRAGMENT_REGISTRATION } from 'packages/shared/src/lib/graphql/fragments/full-fragment-registration';
import { FULL_FRAGMENT_SUBSCRIPTION } from 'packages/shared/src/lib/graphql/fragments/full-fragment-subscription';
import { FULL_FRAGMENT_SYSTEM_DOMAIN } from 'packages/shared/src/lib/graphql/fragments/full-fragment-system-domain';
import { FULL_FRAGMENT_USER } from 'packages/shared/src/lib/graphql/fragments/full-fragment-user';
import { UserOutput } from 'packages/shared/src/lib/graphql/output/user-output';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';

class UserWrapper {
  isSelected = false;

  get nip05s(): string[] {
    const nip05s: string[] = [];
    for (const registration of this.user.registrations ?? []) {
      nip05s.push(
        registration.identifier + '@' + registration.systemDomain.name
      );
    }

    return nip05s;
  }

  constructor(public user: UserOutput) {}
}

class QueuedItem {
  processed = false;
  publishedOnRelays: string[] = [];

  constructor(public user: UserOutput, public counter: number) {}
}

@Component({
  selector: 'app-account-dm',
  templateUrl: './account-dm.component.html',
  styleUrls: ['./account-dm.component.scss'],
})
export class AccountDmComponent implements OnInit {
  loading = false;
  activity = false;
  userWrappers: UserWrapper[] = [];
  text: string | undefined;
  sendFromChris = true;
  queuedItems: QueuedItem[] = [];
  counter = 1;

  constructor(private apollo: Apollo, private toastService: ToastService) {}

  ngOnInit(): void {
    this.#loadData();
  }

  addSelectedToQueue() {
    this.userWrappers
      .filter((x) => x.isSelected)
      .map((x) => x.user)
      .forEach((x) =>
        this.queuedItems.unshift(new QueuedItem(x, this.counter++))
      );
  }

  async sendNext() {
    if (!this.text) {
      return;
    }

    const relevantItem = this.queuedItems
      .sortBy((x) => x.counter)
      .find((x) => !x.processed);
    if (!relevantItem) {
      return;
    }

    this.activity = true;

    try {
      relevantItem.publishedOnRelays = await this.sendDM(
        relevantItem.user.pubkey,
        this.text,
        this.sendFromChris ? 'chris' : 'admin'
      );
      relevantItem.processed = true;
    } catch (error) {
      console.log(error);
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.activity = false;
    }
  }

  async sendDM(
    toPubkey: string,
    text: string,
    from: 'admin' | 'chris'
  ): Promise<string[]> {
    const variables: AdmSendDMQueryArgs = {
      toPubkey,
      text,
      from,
    };

    const result = await firstValueFrom(
      this.apollo.query<AdmSendDMQueryRoot>({
        query: gql`
          query AdmSendDM($toPubkey: String!, $text: String!, $from: String!) {
            admSendDM(toPubkey: $toPubkey, text: $text, from: $from)
          }
        `,
        variables,
        fetchPolicy: 'network-only',
      })
    );

    return result.data.admSendDM;
  }

  async #loadData() {
    try {
      this.loading = true;

      const result = await firstValueFrom(
        this.apollo.query<AdmUsersQueryRoot>({
          query: gql`
            ${FULL_FRAGMENT_USER}
            ${FULL_FRAGMENT_SUBSCRIPTION}
            ${FULL_FRAGMENT_REGISTRATION}
            ${FULL_FRAGMENT_SYSTEM_DOMAIN}
            query AdmUsers {
              admUsers {
                ...FullFragmentUser
                subscription {
                  ...FullFragmentSubscription
                }
                registrations {
                  ...FullFragmentRegistration
                  systemDomain {
                    ...FullFragmentSystemDomain
                  }
                }
              }
            }
          `,
          fetchPolicy: 'network-only',
        })
      );
      for (const user of result.data.admUsers.sortBy(
        (x) => x.createdAt,
        'desc'
      )) {
        this.userWrappers.push(new UserWrapper(user));
      }
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.loading = false;
    }
  }
}
