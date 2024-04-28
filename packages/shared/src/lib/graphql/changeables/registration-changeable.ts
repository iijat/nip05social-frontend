import { Apollo, gql } from 'apollo-angular';
import { Changeable } from './changeable';
import { RegistrationRelayChangeable } from './registration-relay-changeable';
import { firstValueFrom } from 'rxjs';
import { FULL_FRAGMENT_REGISTRATION } from '../fragments/full-fragment-registration';
import {
  UpdateRegistrationMutationArgs,
  UpdateRegistrationMutationRoot,
} from '../crud/registration';
import { RegistrationOutput } from '../output/registration-output';
import { CatchError } from '../../common/catch-error';
import { HelperCheck } from '../../common/helper';

export class RegistrationChangeable extends Changeable<RegistrationOutput> {
  // #region Changeable Properties

  lightningAddress: string | undefined | null;
  emailForwardingOn: boolean | undefined | null;
  emailOut: boolean;
  emailOutSubject: string;
  registrationRelayChangeables: RegistrationRelayChangeable[] = [];

  // #endregion Changeable Properties

  // #region Computed Properties

  get hasLightningAddressChanged(): boolean {
    return this.original.lightningAddress != this.lightningAddress;
  }

  get isLightningAddressValid(): boolean {
    return HelperCheck.isValidLightningAddress(this.lightningAddress);
  }

  get hasEmailForwardingOnChanged(): boolean {
    return this.original.emailForwardingOn !== this.emailForwardingOn;
  }

  get invalidLightningAddressMessage(): string {
    return 'Invalid lightning address. Use aaa@bbb.ccc';
  }

  get hasEmailOutChanged(): boolean {
    return this.original.emailOut !== this.emailOut;
  }

  get hasEmailOutSubjectChanged(): boolean {
    return this.original.emailOutSubject !== this.emailOutSubject;
  }

  // #endregion Computed Properties

  // #region Properties

  activity = false;

  // #endregion Properties

  // #region Constructor

  constructor(registration: RegistrationOutput, private _apollo: Apollo) {
    super(registration);
    this.lightningAddress = registration.lightningAddress;
    this.emailForwardingOn = registration.emailForwardingOn;
    this.emailOut = registration.emailOut;
    this.emailOutSubject = registration.emailOutSubject;
  }

  // #endregion Constructor

  // #region Public Methods

  async save(): Promise<string | undefined> {
    if (
      !this.hasLightningAddressChanged &&
      !this.hasEmailForwardingOnChanged &&
      !this.hasEmailOutChanged &&
      !this.hasEmailOutSubjectChanged
    ) {
      return undefined;
    }

    if (this.hasLightningAddressChanged && !this.isLightningAddressValid) {
      return undefined;
    }

    try {
      this.activity = true;

      const variables: UpdateRegistrationMutationArgs = {
        registrationId: this.original.id,
        data: {
          lightningAddress: this.lightningAddress ?? null,
          emailForwardingOn: this.emailForwardingOn ?? false,
          emailOut: this.emailOut,
          emailOutSubject: this.emailOutSubject,
        },
      };
      await firstValueFrom(
        this._apollo.mutate<UpdateRegistrationMutationRoot>({
          mutation: gql`
            ${FULL_FRAGMENT_REGISTRATION}
            mutation UpdateRegistration(
              $registrationId: String!
              $data: RegistrationInputUpdate!
            ) {
              updateRegistration(registrationId: $registrationId, data: $data) {
                ...FullFragmentRegistration
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );
      return undefined;
    } catch (error) {
      const message = new CatchError(error).message;
      console.log(message);
      return message;
    } finally {
      this.activity = false;
    }
  }

  // #endregion Public Methods

  static createMany(
    registrations: RegistrationOutput[],
    apollo: Apollo
  ): RegistrationChangeable[] {
    const changeables: RegistrationChangeable[] = [];

    for (const x of registrations) {
      const newChangeable = new RegistrationChangeable(x, apollo);
      if (
        typeof x.registrationRelays !== 'undefined' &&
        x.registrationRelays != null &&
        Array.isArray(x.registrationRelays) &&
        x.registrationRelays.length > 0
      ) {
        newChangeable.registrationRelayChangeables =
          RegistrationRelayChangeable.createMany(x.registrationRelays, apollo);
      }
      changeables.push(newChangeable);
    }

    return changeables;
  }
}
