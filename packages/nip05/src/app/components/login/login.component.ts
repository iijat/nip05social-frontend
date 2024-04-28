import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import {
  ErrorHandling,
  getErrorMessageFromFormControl,
} from '../../helpers/error-handling';
import { ResponsiveService } from '../../services/responsive.service';
import * as uuid from 'uuid';
import { LocalStorageService } from '../../services/local-storage.service';
import { CatchError } from 'shared';
import {
  NostrEventKind,
  NostrUnsignedEvent,
} from '../../models/nostr/type-defs';
import { NostrHelperV2 } from '../../models/nostr/nostr-helper-v2';
import { HelperValidators } from 'packages/shared/src/lib/common/helper';
import { SystemRelayOutput } from 'packages/shared/src/lib/graphql/output/system-relay-output';
import { FULL_FRAGMENT_SYSTEM_RELAY } from 'packages/shared/src/lib/graphql/fragments/full-fragment-system-relay';
import { SystemRelaysQueryRoot } from 'packages/shared/src/lib/graphql/crud/system-relay';
import {
  CreateLoginCodeMutationArgs,
  CreateLoginCodeMutationRoot,
  CreateLoginNip07CodeMutationArgs,
  CreateLoginNip07CodeMutationRoot,
  RedeemLoginCodeMutationArgs,
  RedeemLoginCodeMutationRoot,
  RedeemLoginNip07CodeMutationArgs,
  RedeemLoginNip07CodeMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/login';
import { IsAuthenticatedQueryRoot } from 'packages/shared/src/lib/graphql/queries-and-mutations/auth';
import { TokenService } from 'packages/shared/src/lib/services/token.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

class Response {
  success: boolean;
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

enum LoginSendOption {
  ViaPredefinedList = '1',
  ViaUserList = '2',
  ViaCustomRelay = '3',
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // #region Public Properties

  uuid1 = uuid.v4();
  loading = false;
  alreadyLoggedIn = false;
  forwardCounter = 3;

  loginFormGroup = this._formBuilder.group({
    pubkey: new FormControl<string | null>(null, Validators.required),
    relay: new FormControl<string | null>(null, [
      Validators.required,
      HelperValidators.isRelayAddress,
    ]),
    loginSendOption: new FormControl<string | null>('1'),
  });

  createLoginCodeResponses: Response[] | undefined;
  createLoginCodeActivity = false;
  createLoginCodeRelayActivity = false;

  userId: string | undefined;
  code = new FormControl<string | null>(null, Validators.required);

  redeemLoginCodeResponse: Response | undefined;
  redeemLoginCodeActivity = false;

  getErrorMessageFromFormControl = getErrorMessageFromFormControl;

  systemRelays: Observable<SystemRelayOutput[]> | undefined;
  nip46SystemRelay: SystemRelayOutput | undefined;

  nip05BrowserExtensionAvailable = false;

  nip46Uri: string | undefined;
  signerLogEntry: string | undefined;
  nip07LoginInProgress = false;

  // #endregion Public Properties

  // #region Private Properties

  forwardInterval: number | undefined;
  _jobStateChangeSubscription: Subscription | undefined;

  // #endregion Private Properties

  // #region Constructor

  constructor(
    private _formBuilder: FormBuilder,
    private _apollo: Apollo,
    private _tokenService: TokenService,
    private _router: Router,
    private _toastService: ToastService,
    public responsiveService: ResponsiveService,
    private _localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.systemRelays = this._apollo
      .query<SystemRelaysQueryRoot>({
        query: gql`
          ${FULL_FRAGMENT_SYSTEM_RELAY}
          query SystemRelays {
            systemRelays {
              ...FullFragmentSystemRelay
            }
          }
        `,
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((result) => {
          return result.data.systemRelays;
        })
      );

    const cache = this._localStorageService.readLoginData();
    if (cache.pubkey) {
      this.loginFormGroup.controls.pubkey.setValue(cache.pubkey);
    }

    if (cache.relay) {
      this.loginFormGroup.controls.relay.setValue(cache.relay);
    }

    this._checkIsAuthenticated();

    // Check, if an NIP-07 browser extension is available.
    // If so, login via the extension will also be made available.
    if (window.nostr) {
      this.nip05BrowserExtensionAvailable = true;
    }
  }

  ngOnDestroy(): void {
    window.clearInterval(this.forwardInterval);

    this._jobStateChangeSubscription?.unsubscribe();
  }

  // #endregion Constructor

  // #region Public Methods

  async onClickNIP07Login() {
    if (!window.nostr) {
      return;
    }

    this.nip07LoginInProgress = true;
    try {
      // 1: Get pubkey from Browser Extension
      const pubkey = await window.nostr.getPublicKey();

      // 2: Get code that needs to be embedded into content to Api.
      const variables1: CreateLoginNip07CodeMutationArgs = {
        pubkey,
      };

      const result1 = await firstValueFrom(
        this._apollo.mutate<CreateLoginNip07CodeMutationRoot>({
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
      const event: NostrUnsignedEvent = {
        kind: NostrEventKind.Text,
        content: `This is a test note to verify that you are in control of your pubkey. It will NOT be published. ${code}.`,
        created_at: NostrHelperV2.getCreatedAt(),
        tags: [],
      };
      const signedEvent = await window.nostr.signEvent(event);

      // 4: Send signed event to Api where it will be verified.
      const variables2: RedeemLoginNip07CodeMutationArgs = {
        deviceId: this._localStorageService.readDeviceId() ?? 'na',
        data: signedEvent,
      };
      const result2 = await firstValueFrom(
        this._apollo.mutate<RedeemLoginNip07CodeMutationRoot>({
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

      this._tokenService.setToken(result2.data?.redeemLoginNip07Code);
      this._router.navigate(['s/home']);
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.nip07LoginInProgress = false;
    }
  }

  async createLoginCode() {
    if (
      this.loginFormGroup.controls.loginSendOption.value ===
        LoginSendOption.ViaCustomRelay &&
      !this.loginFormGroup.valid
    ) {
      return;
    }

    if (
      this.loginFormGroup.controls.loginSendOption.value ===
        LoginSendOption.ViaPredefinedList &&
      !this.loginFormGroup.controls.pubkey.valid
    ) {
      return;
    }

    this.userId = undefined;
    this.createLoginCodeActivity = true;
    this.createLoginCodeRelayActivity = true;
    this.createLoginCodeResponses = undefined;
    try {
      const pubkey =
        this.loginFormGroup.controls.pubkey.value?.toLowerCase() ?? '';
      const relay =
        this.loginFormGroup.controls.relay.value?.toLowerCase() ?? '';

      const jobId = uuid.v4();
      const variables: CreateLoginCodeMutationArgs = {
        pubkey,
        //relay,
        jobId,
      };

      if (
        this.loginFormGroup.controls.loginSendOption.value ===
        LoginSendOption.ViaCustomRelay
      ) {
        variables.relay = this.loginFormGroup.controls.relay.value ?? undefined;
      }

      // Store npub and relay to localStorage
      this._localStorageService.storeLoginData(
        pubkey,
        this.loginFormGroup.controls.relay.value?.toLowerCase() ?? ''
      );

      const result = await firstValueFrom(
        this._apollo.mutate<CreateLoginCodeMutationRoot>({
          mutation: gql`
            mutation CreateLoginCode(
              $pubkey: String!
              $relay: String
              $jobId: String!
            ) {
              createLoginCode(pubkey: $pubkey, relay: $relay, jobId: $jobId)
            }
          `,
          variables,
          fetchPolicy: 'no-cache',
        })
      );

      this.userId = result.data?.createLoginCode;
    } catch (error) {
      const message = ErrorHandling.extract(error);

      this._toastService.error(message, 'Error');
      this.createLoginCodeRelayActivity = false;
    } finally {
      this.createLoginCodeActivity = false;
    }
  }

  async redeemLoginCode() {
    if (!this.userId || !this.code.valid) {
      return;
    }

    this.redeemLoginCodeActivity = true;
    this.redeemLoginCodeResponse = undefined;
    try {
      const code = this.code.value?.replaceAll(' ', '');

      const variables: RedeemLoginCodeMutationArgs = {
        userId: this.userId ?? '',
        deviceId: this._localStorageService.readDeviceId() ?? '',
        code: code ?? '',
      };

      const result = await firstValueFrom(
        this._apollo.mutate<RedeemLoginCodeMutationRoot>({
          mutation: gql`
            mutation RedeemLoginCode(
              $userId: String!
              $deviceId: String!
              $code: String!
            ) {
              redeemLoginCode(
                userId: $userId
                deviceId: $deviceId
                code: $code
              ) {
                id
                userId
                deviceId
                token
                validUntil
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );

      this._tokenService.setToken(result.data?.redeemLoginCode);
      this._router.navigate(['s/home']);
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.redeemLoginCodeActivity = false;
    }
  }

  // #endregion Public Methods

  // #region Private Methods

  private async _checkIsAuthenticated() {
    this.loading = true;

    try {
      const result = await firstValueFrom(
        this._apollo.query<IsAuthenticatedQueryRoot>({
          query: gql`
            query IsAuthenticated {
              isAuthenticated {
                id
                userId
                deviceId
                token
                validUntil
              }
            }
          `,
          fetchPolicy: 'network-only',
        })
      );

      const userToken = result.data.isAuthenticated;
      if (userToken) {
        this.alreadyLoggedIn = true;
        this._tokenService.setToken(userToken);

        this.forwardInterval = window.setInterval(() => {
          this.forwardCounter--;
          if (this.forwardCounter === 0) {
            window.clearInterval(this.forwardInterval);
            this._router.navigate(['s/home']);
          }
        }, 1000);
      } else {
        this._tokenService.unsetToken();
      }
    } catch (error) {
      this._tokenService.unsetToken();
    } finally {
      this.loading = false;
    }
  }

  // #endregion Private Methods
}
