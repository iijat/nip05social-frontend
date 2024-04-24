import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Apollo, QueryRef, gql } from 'apollo-angular';
import {
  AdmCreatePublicRelayMutationArgs,
  AdmCreatePublicRelayMutationRoot,
  AdmUpdatePublicRelayMutationArgs,
  AdmUpdatePublicRelayMutationRoot,
  PublicRelaysQueryRoot,
} from 'packages/shared/src/lib/graphql/crud/public-relay';
import { FULL_FRAGMENT_PUBLIC_RELAY } from 'packages/shared/src/lib/graphql/fragments/full-fragment-public-relay';
import { PublicRelayOutput } from 'packages/shared/src/lib/graphql/output/public-relay-output';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';
import { v4 } from 'uuid';

const publicRelaysQuery = gql`
  ${FULL_FRAGMENT_PUBLIC_RELAY}
  query PublicRelays {
    publicRelays {
      ...FullFragmentPublicRelay
    }
  }
`;

@Component({
  selector: 'app-public-relays',
  templateUrl: './public-relays.component.html',
  styleUrls: ['./public-relays.component.scss'],
})
export class PublicRelaysComponent implements OnInit, OnDestroy {
  loading = false;
  activity = false;
  publicRelays: PublicRelayOutput[] = [];
  readonly uuid1 = v4();
  relayUrl: string | undefined;

  #publicRelaysQuery: QueryRef<PublicRelaysQueryRoot> | undefined;
  #publicRelaysSubscription: Subscription | undefined;

  constructor(private apollo: Apollo, private toastService: ToastService) {}

  ngOnInit(): void {
    this.#loadData();
  }

  ngOnDestroy(): void {
    this.#publicRelaysSubscription?.unsubscribe();
  }

  async createRelay() {
    if (!this.relayUrl) {
      return;
    }

    try {
      this.activity = true;
      const variables: AdmCreatePublicRelayMutationArgs = {
        url: this.relayUrl,
        notes: null,
      };

      await firstValueFrom(
        this.apollo.mutate<AdmCreatePublicRelayMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_PUBLIC_RELAY}
            mutation AdmCreatePublicRelay($url: String!, $notes: String) {
              admCreatePublicRelay(url: $url, notes: $notes) {
                ...FullFragmentPublicRelay
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
          update: (cache, { data }) => {
            if (!data?.admCreatePublicRelay) {
              return;
            }

            const cachedArray =
              cache.readQuery<PublicRelaysQueryRoot>({
                query: publicRelaysQuery,
              })?.publicRelays ?? [];

            cache.writeQuery<PublicRelaysQueryRoot>({
              query: publicRelaysQuery,
              data: {
                publicRelays: [...cachedArray, data.admCreatePublicRelay],
              },
            });
          },
        })
      );
      this.relayUrl = undefined;
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.activity = false;
    }
  }

  async onIsActiveChange(
    newValue: boolean,
    relay: PublicRelayOutput,
    element: MatSlideToggle
  ) {
    try {
      this.activity = true;
      const variables: AdmUpdatePublicRelayMutationArgs = {
        id: relay.id,
        data: {
          isActive: newValue,
          url: null,
          notes: null,
        },
      };

      await firstValueFrom(
        this.apollo.mutate<AdmUpdatePublicRelayMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_PUBLIC_RELAY}
            mutation AdmUpdatePublicRelay(
              $id: Int!
              $data: PublicRelayInputUpdate!
            ) {
              admUpdatePublicRelay(id: $id, data: $data) {
                ...FullFragmentPublicRelay
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
      element.checked = relay.isActive;
    } finally {
      this.activity = false;
    }
  }

  async #loadData() {
    this.#publicRelaysQuery = this.apollo.watchQuery<PublicRelaysQueryRoot>({
      query: publicRelaysQuery,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-only',
    });

    this.#publicRelaysSubscription =
      this.#publicRelaysQuery.valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.publicRelays = data.publicRelays.sortBy((x) => x.id, 'asc');
          if (!loading) {
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.toastService.error(new CatchError(error).message);
        },
      });
  }
}
