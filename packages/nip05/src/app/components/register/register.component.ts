import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Subscription, firstValueFrom } from 'rxjs';
import {
  ErrorHandling,
  getErrorMessageFromFormControl,
} from '../../helpers/error-handling';
import { LocalStorageService } from '../../services/local-storage.service';
import { ResponsiveService } from '../../services/responsive.service';
import { CatchError, Loading, sleep } from 'shared';
import { v4 } from 'uuid';
import {
  NostrEventKind,
  NostrUnsignedEvent,
} from '../../models/nostr/type-defs';
import { NostrHelperV2 } from '../../models/nostr/nostr-helper-v2';
import { SystemDomainOutput } from 'packages/shared/src/lib/graphql/output/system-domain-output';
import { HelperValidators } from 'packages/shared/src/lib/common/helper';
import { IdentifierRegisterCheckOutput } from 'packages/shared/src/lib/graphql/output/identifier-register-check-output';
import { RegistrationOutput } from 'packages/shared/src/lib/graphql/output/registration-output';
import { SystemRelayOutput } from 'packages/shared/src/lib/graphql/output/system-relay-output';
import {
  CreateRegistrationCodeMutationArgs,
  CreateRegistrationCodeMutationRoot,
  CreateRegistrationNip07CodeMutationArgs,
  CreateRegistrationNip07CodeMutationRoot,
  IsRegistrationAvailableQueryArgs,
  IsRegistrationAvailableQueryRoot,
  RedeemRegistrationCodeMutationArgs,
  RedeemRegistrationCodeMutationRoot,
  RedeemRegistrationNip07CodeMutationArgs,
  RedeemRegistrationNip07CodeMutationRoot,
  ResendRegistrationCodeMutationArgs,
  ResendRegistrationCodeMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/registration';
import { FULL_FRAGMENT_REGISTRATION } from 'packages/shared/src/lib/graphql/fragments/full-fragment-registration';
import {
  JobStateChangeSubscriptionArgs,
  JobStateChangeSubscriptionRoot,
} from 'packages/shared/src/lib/graphql/crud/subscriptions';
import { FULL_FRAGMENT_JOB_UPDATE } from 'packages/shared/src/lib/graphql/fragments/full-fragment-job-update';
import { SystemDomainsQueryRoot } from 'packages/shared/src/lib/graphql/crud/system-domain';
import { FULL_FRAGMENT_SYSTEM_DOMAIN } from 'packages/shared/src/lib/graphql/fragments/full-fragment-system-domain';
import { SystemRelaysQueryRoot } from 'packages/shared/src/lib/graphql/crud/system-relay';
import { FULL_FRAGMENT_SYSTEM_RELAY } from 'packages/shared/src/lib/graphql/fragments/full-fragment-system-relay';
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

enum RegisterSendOption {
  ViaPredefinedList = '1',
  ViaUserList = '2',
  ViaCustomRelay = '3',
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  // #region Public Properties

  loading = new Loading(2);
  nip05BrowserExtensionAvailable = false;

  name = new FormControl<string | null>(null, Validators.required);
  pubkey = new FormControl<string | null>(null, Validators.required);
  relay = new FormControl<string | null>(null, [
    Validators.required,
    HelperValidators.isRelayAddress,
  ]);
  code = new FormControl<string | null>(null, Validators.required);
  registrationSendOption = new FormControl<string | null>(
    RegisterSendOption.ViaPredefinedList
  );

  systemDomains: SystemDomainOutput[] = [];
  selectedSystemDomain = new FormControl<SystemDomainOutput | null>(null);

  registrationCheck: IdentifierRegisterCheckOutput | undefined;
  registrationCheckActivity = false;

  registration: RegistrationOutput | undefined;

  createRegistrationCodeResponses: Response[] | undefined;
  createRegistrationCodeActivity = false;
  resendRegistrationCodeActivity = false;
  createRegistrationCodeRelayActivity = false;

  redeemRegistrationCodeResponse: Response | undefined;
  redeemRegistrationCodeActivity = false;

  getErrorMessageFromFormControl = getErrorMessageFromFormControl;

  nip46Uri: string | undefined;
  signerLogEntry: string | undefined;
  systemRelays: SystemRelayOutput[] = [];
  nip07RegisterInProgress = false;

  // #endregion Public Properties

  // #region Private Properties

  private _timeoutDelayedAvailabilityCheck: number | undefined;
  private _jobStateChangeSubscription: Subscription | undefined;

  // #endregion Private Properties

  // #region Init

  constructor(
    private _apollo: Apollo,
    private _tokenService: TokenService,
    private _toastService: ToastService,
    public responsiveService: ResponsiveService,
    private _router: Router,
    private _localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this._loadSystemDomains(1);
    this._loadSystemRelays(2);

    const cache = this._localStorageService.readRegisterData();
    if (cache.pubkey) {
      this.pubkey.setValue(cache.pubkey);
    }

    if (cache.relay) {
      this.relay.setValue(cache.relay);
    }

    // Check, if an NIP-07 browser extension is available.
    // If so, registration via the extension will also be made available.
    if (window.nostr) {
      this.nip05BrowserExtensionAvailable = true;
    }
  }

  ngOnDestroy(): void {
    this._jobStateChangeSubscription?.unsubscribe();
  }

  // #endregion Init

  // #region Public Methods

  async onClickNIP07Register() {
    if (!window.nostr) {
      return;
    }
    this.nip07RegisterInProgress = true;
    try {
      // 1: Get pubkey from Browser Extension
      const pubkey = await window.nostr.getPublicKey();

      // 2: Get code from Api that needs to be embedded into content from Api.
      const systemDomainId = this.selectedSystemDomain.value?.id ?? -1;
      const name = this.name.value ?? 'chris';
      const variables1: CreateRegistrationNip07CodeMutationArgs = {
        pubkey,
        systemDomainId,
        name,
      };
      const result1 = await firstValueFrom(
        this._apollo.mutate<CreateRegistrationNip07CodeMutationRoot>({
          mutation: gql`
            mutation CreateRegistrationNip07Code(
              $pubkey: String!
              $name: String!
              $systemDomainId: Int!
            ) {
              createRegistrationNip07Code(
                pubkey: $pubkey
                name: $name
                systemDomainId: $systemDomainId
              ) {
                code
                registrationId
              }
            }
          `,
          variables: variables1,
          fetchPolicy: 'no-cache',
        })
      );
      const nip07 = result1.data?.createRegistrationNip07Code;
      if (!nip07) {
        throw new Error('Could not retrieve code from backend.');
      }

      // 3: Create and sign event (via Browser Extension) with embedded code from the Api.
      const event: NostrUnsignedEvent = {
        kind: NostrEventKind.Text,
        content: `This is a test note to verify that you are in control of your pubkey. It will NOT be published. ${nip07.code}.`,
        created_at: NostrHelperV2.getCreatedAt(),
        tags: [],
      };
      const signedEvent = await window.nostr.signEvent(event);

      // 4: Send signed event to Api where it will be verified.
      const variables2: RedeemRegistrationNip07CodeMutationArgs = {
        deviceId: this._localStorageService.readDeviceId() ?? 'na',
        registrationId: nip07.registrationId,
        data: signedEvent,
      };
      const result2 = await firstValueFrom(
        this._apollo.mutate<RedeemRegistrationNip07CodeMutationRoot>({
          mutation: gql`
            mutation RedeemRegistrationNip07Code(
              $deviceId: String!
              $registrationId: String!
              $data: Nip07RedeemInput!
            ) {
              redeemRegistrationNip07Code(
                deviceId: $deviceId
                registrationId: $registrationId
                data: $data
              ) {
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

      this._tokenService.setToken(result2.data?.redeemRegistrationNip07Code);
      this._router.navigate(['s/home']);
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.nip07RegisterInProgress = false;
    }
  }

  delayedAvailabilityCheck() {
    window.clearTimeout(this._timeoutDelayedAvailabilityCheck);
    this._timeoutDelayedAvailabilityCheck = window.setTimeout(async () => {
      try {
        if (this.name.invalid || this.selectedSystemDomain.invalid) {
          return;
        }

        this.registrationCheckActivity = true;
        this.registrationCheck = undefined;

        const variables: IsRegistrationAvailableQueryArgs = {
          name: this.name.value ?? 'will not happen',
          systemDomainId: this.selectedSystemDomain.value?.id ?? 1,
        };

        const result = await firstValueFrom(
          this._apollo.query<IsRegistrationAvailableQueryRoot>({
            query: gql`
              query IsRegistrationAvailable(
                $systemDomainId: Int!
                $name: String!
              ) {
                isRegistrationAvailable(
                  name: $name
                  systemDomainId: $systemDomainId
                ) {
                  name
                  canBeRegistered
                  reason
                }
              }
            `,
            variables,
            fetchPolicy: 'no-cache',
          })
        );

        this.registrationCheck = result.data.isRegistrationAvailable;
      } catch (error) {
        const message = new CatchError(error).message;
        this._toastService.error(message, 'Error');
      } finally {
        this.registrationCheckActivity = false;
      }
    }, 600);
  }

  async createRegistrationCode() {
    if (
      this.name.invalid ||
      !this.name.value ||
      this.selectedSystemDomain.invalid ||
      !this.selectedSystemDomain.value ||
      this.pubkey.invalid ||
      !this.pubkey.value ||
      !this.registrationSendOption.value ||
      (this.registrationSendOption.value ===
        RegisterSendOption.ViaCustomRelay &&
        (this.relay.invalid || !this.relay.value))
    ) {
      return;
    }

    this.createRegistrationCodeActivity = true;
    this.createRegistrationCodeRelayActivity = true;
    this.createRegistrationCodeResponses = undefined;

    try {
      const jobId = v4();

      const variables: CreateRegistrationCodeMutationArgs = {
        name: this.name.value,
        systemDomainId: this.selectedSystemDomain.value.id,
        pubkey: this.pubkey.value.toLowerCase(),
        jobId,
      };

      if (
        this.registrationSendOption.value === RegisterSendOption.ViaCustomRelay
      ) {
        variables.relay = (this.relay.value as string).toLowerCase();
        this._localStorageService.storeRegisterDataRelay(
          (this.relay.value as string).toLowerCase()
        );
      }

      const result = await firstValueFrom(
        this._apollo.mutate<CreateRegistrationCodeMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_REGISTRATION}
            mutation CreateRegistrationCode(
              $name: String!
              $pubkey: String!
              $relay: String
              $systemDomainId: Int!
              $jobId: String!
            ) {
              createRegistrationCode(
                name: $name
                pubkey: $pubkey
                relay: $relay
                systemDomainId: $systemDomainId
                jobId: $jobId
              ) {
                ...FullFragmentRegistration
              }
            }
          `,
          variables,
          fetchPolicy: 'no-cache',
        })
      );
      this.registration = result.data?.createRegistrationCode;
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
      this.createRegistrationCodeRelayActivity = false;
    } finally {
      this.createRegistrationCodeActivity = false;
    }
  }

  async resendRegistrationCode() {
    if (
      !this.registration ||
      this.relay.invalid ||
      !this.relay.value ||
      this.selectedSystemDomain.invalid ||
      !this.selectedSystemDomain.value ||
      this.pubkey.invalid ||
      !this.pubkey.value
    ) {
      return;
    }

    this.resendRegistrationCodeActivity = true;
    this.createRegistrationCodeRelayActivity = true;
    this.createRegistrationCodeResponses = undefined;

    try {
      const jobId = v4();

      const variables: ResendRegistrationCodeMutationArgs = {
        registrationId: this.registration.id,
        userId: this.registration.userId,
        pubkey: this.pubkey.value,
        jobId,
      };

      if (
        this.registrationSendOption.value === RegisterSendOption.ViaCustomRelay
      ) {
        variables.relay = this.relay.value.toLowerCase();
      }

      this._localStorageService.storeRegisterDataRelay(
        this.relay.value.toLowerCase()
      );

      // Before posting the mutation, create a GraphQL subscription
      this._subscribeToJobStateChanges(this.pubkey.value, jobId);
      await sleep(800);

      const result = await firstValueFrom(
        this._apollo.mutate<ResendRegistrationCodeMutationRoot>({
          mutation: gql`
            mutation ResendRegistrationCode(
              $registrationId: String!
              $userId: String!
              $pubkey: String!
              $jobId: String!
              $relay: String
            ) {
              resendRegistrationCode(
                registrationId: $registrationId
                userId: $userId
                pubkey: $pubkey
                jobId: $jobId
                relay: $relay
              )
            }
          `,
          variables,
          fetchPolicy: 'no-cache',
        })
      );
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
      this.createRegistrationCodeRelayActivity = false;
    } finally {
      this.resendRegistrationCodeActivity = false;
    }
  }

  async redeemRegistrationCode() {
    if (!this.registration || this.code.invalid || !this.code.value) {
      return;
    }

    this.redeemRegistrationCodeActivity = true;
    this.redeemRegistrationCodeResponse = undefined;

    try {
      const code = this.code.value.replaceAll(' ', '');

      const variables: RedeemRegistrationCodeMutationArgs = {
        registrationId: this.registration.id,
        userId: this.registration.userId,
        deviceId: this._localStorageService.readDeviceId() ?? '',
        code: code,
      };

      const result = await firstValueFrom(
        this._apollo.mutate<RedeemRegistrationCodeMutationRoot>({
          mutation: gql`
            mutation RedeemRegistrationCode(
              $registrationId: String!
              $userId: String!
              $deviceId: String!
              $code: String!
            ) {
              redeemRegistrationCode(
                registrationId: $registrationId
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

      this._tokenService.setToken(result.data?.redeemRegistrationCode);
      this._router.navigate(['s/home']);
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.redeemRegistrationCodeActivity = false;
    }
  }

  // #endregion Public Methods

  // #region Private Methods

  private _subscribeToJobStateChanges(pubkey: string, jobId: string) {
    this._jobStateChangeSubscription?.unsubscribe();

    const variables: JobStateChangeSubscriptionArgs = {
      pubkey,
      jobId,
    };

    this._jobStateChangeSubscription = this._apollo
      .subscribe<JobStateChangeSubscriptionRoot>({
        query: gql`
          ${FULL_FRAGMENT_JOB_UPDATE}
          subscription JobStateChange($pubkey: String!, $jobId: String!) {
            jobStateChange(pubkey: $pubkey, jobId: $jobId) {
              ...FullFragmentJobUpdate
            }
          }
        `,
        variables,
      })
      .subscribe((result) => {
        console.log('hi');
        if (typeof this.createRegistrationCodeResponses === 'undefined') {
          this.createRegistrationCodeResponses = [];
        }

        const response = result.data?.jobStateChange;
        if (!response) {
          return;
        }

        const message = `${response.item
          .toString()
          .padStart(2, '0')}/${response.ofItems
          .toString()
          .padStart(2, '0')} - ${response.relay}`;

        this.createRegistrationCodeResponses.push(
          new Response(response.success, message)
        );

        if (response.item === response.ofItems) {
          this.createRegistrationCodeRelayActivity = false;
          this._jobStateChangeSubscription?.unsubscribe();
        }
      });
  }

  private async _loadSystemDomains(jobNumber: number) {
    this.loading.indicateJobStart(jobNumber);

    try {
      const result = await firstValueFrom(
        this._apollo.query<SystemDomainsQueryRoot>({
          query: gql`
            ${FULL_FRAGMENT_SYSTEM_DOMAIN}
            query SystemDomains {
              systemDomains {
                ...FullFragmentSystemDomain
              }
            }
          `,
          fetchPolicy: 'cache-first',
        })
      );

      this.systemDomains = result.data.systemDomains;
      this.selectedSystemDomain.setValue(this.systemDomains[0]);
    } catch (error) {
      const message = ErrorHandling.extract(error);
      this._toastService.error(message, 'Error');
    } finally {
      this.loading.indicateJobEnd(jobNumber);
    }
  }

  private async _loadSystemRelays(jobNumber: number) {
    this.loading.indicateJobStart(jobNumber);
    try {
      const result = await firstValueFrom(
        this._apollo.query<SystemRelaysQueryRoot>({
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
      );

      this.systemRelays = result.data.systemRelays;
    } catch (error) {
      const message = new CatchError(error).message;
      this._toastService.error(message, 'Error');
    } finally {
      this.loading.indicateJobEnd(jobNumber);
    }
  }

  // #endregion Private Methods
}
