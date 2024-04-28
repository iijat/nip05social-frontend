import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {
  CreateLoginNip07CodeMutationArgs,
  CreateLoginNip07CodeMutationRoot,
  RedeemLoginNip07CodeMutationArgs,
  RedeemLoginNip07CodeMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/login';
import { firstValueFrom } from 'rxjs';
import { CatchError } from 'shared';
import { ADM_LOCAL_STORAGE } from '../../common/local-storage';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { Router } from '@angular/router';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { EventTemplate } from 'nostr-tools';
import '../../common/window-nostr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private apollo: Apollo,
    private router: Router,
    private tokenService: TokenService,
    private toastService: ToastService
  ) {}

  async login() {
    if (!window.nostr) {
      return;
    }

    try {
      const pubkey = await window.nostr.getPublicKey();

      const variables1: CreateLoginNip07CodeMutationArgs = {
        pubkey,
      };

      const result1 = await firstValueFrom(
        this.apollo.mutate<CreateLoginNip07CodeMutationRoot>({
          mutation: gql`
            mutation CreateLoginNip07Code($pubkey: String!) {
              createLoginNip07Code(pubkey: $pubkey)
            }
          `,
          variables: variables1,
          fetchPolicy: 'no-cache',
        })
      );

      const code = result1.data?.createLoginNip07Code;
      if (!code) {
        throw new Error('Could not retrieve code from backend.');
      }

      // 3: Create and sign event (via Browser Extension) with the embedded code from the Api.
      const event: EventTemplate = {
        kind: 1,
        content: `This is a test note to verify that you are in control of your pubkey. It will NOT be published. ${code}.`,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      };
      const signedEvent = await window.nostr.signEvent(event);

      // 4: Send signed event to Api where it will be verified.
      const variables2: RedeemLoginNip07CodeMutationArgs = {
        deviceId: localStorage.getItem(ADM_LOCAL_STORAGE.DEVICE_ID) ?? 'na',
        data: signedEvent,
      };
      const result2 = await firstValueFrom(
        this.apollo.mutate<RedeemLoginNip07CodeMutationRoot>({
          mutation: gql`
            mutation RedeemLoginNip07Code(
              $deviceId: String!
              $data: Nip07RedeemInput!
            ) {
              redeemLoginNip07Code(deviceId: $deviceId, data: $data) {
                id
                userId
                deviceId
                token
                validUntil
              }
            }
          `,
          variables: variables2,
          fetchPolicy: 'no-cache',
        })
      );

      this.tokenService.setToken(result2.data?.redeemLoginNip07Code);
      this.router.navigate(['/home']);
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    }
  }
}
