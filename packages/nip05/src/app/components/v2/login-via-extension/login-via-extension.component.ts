import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  LoginViaExtensionMutationArgs,
  LoginViaExtensionMutationRoot,
  LoginViaExtensionRedeemMutationArgs,
  LoginViaExtensionRedeemMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/login';
import { LocalStorageService } from '../../../services/local-storage.service';
import { firstValueFrom } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';
import { CatchError, NostrUnsignedEvent } from 'shared';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-via-extension',
  templateUrl: './login-via-extension.component.html',
  styleUrl: './login-via-extension.component.scss',
})
export class LoginViaExtensionComponent implements OnInit {
  extensionAvailable = true;
  activity = false;

  constructor(
    private location: Location,
    private localStorageService: LocalStorageService,
    private apollo: Apollo,
    private toastService: ToastService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check, if an NIP-07 browser extension is available.
    // If so, login via the extension will also be made available.
    if (!window.nostr) {
      this.extensionAvailable = false;
    } else {
      this.#loginViaExtension();
    }
  }

  navigateBack() {
    this.location.back();
  }

  async #loginViaExtension() {
    if (!window.nostr) {
      return;
    }

    this.activity = true;
    try {
      // 1: Get pubkey from Browser Extension
      const pubkey = await window.nostr.getPublicKey();

      // 2: Get code that needs to be embedded into content to Api.
      const variables1: LoginViaExtensionMutationArgs = {
        pubkey,
        deviceId: this.localStorageService.readDeviceId() ?? 'na',
      };

      const result1 = await firstValueFrom(
        this.apollo.mutate<LoginViaExtensionMutationRoot>({
          mutation: gql`
            mutation LoginViaExtension($pubkey: String!, $deviceId: String!) {
              loginViaExtension(pubkey: $pubkey, deviceId: $deviceId)
            }
          `,
          variables: variables1,
          fetchPolicy: 'no-cache',
        })
      );

      const code = result1.data?.loginViaExtension;
      if (!code) {
        throw new Error('Could not retrieve code from backend.');
      }

      // 3: Create and sign event (via Browser Extension) with the embedded code from the Api.
      const event: NostrUnsignedEvent = {
        kind: 1,
        content: `This is a test note to verify that you are in control of your pubkey. It will NOT be published. ${code}.`,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      };
      const signedEvent = await window.nostr.signEvent(event);

      // 4: Send signed event to Api where it will be verified.
      const variables2: LoginViaExtensionRedeemMutationArgs = {
        deviceId: this.localStorageService.readDeviceId() ?? 'na',
        data: signedEvent,
      };
      const result2 = await firstValueFrom(
        this.apollo.mutate<LoginViaExtensionRedeemMutationRoot>({
          mutation: gql`
            mutation LoginViaExtensionRedeem(
              $deviceId: String!
              $data: Nip07RedeemInput!
            ) {
              loginViaExtensionRedeem(deviceId: $deviceId, data: $data) {
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

      this.tokenService.setToken(result2.data?.loginViaExtensionRedeem);
      this.router.navigateByUrl('s/account');
    } catch (error) {
      this.toastService.error(new CatchError(error).message);
    } finally {
      this.activity = false;
    }
  }
}
