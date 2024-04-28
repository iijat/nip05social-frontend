import { Apollo, gql } from 'apollo-angular';
import { Changeable } from './changeable';
import { firstValueFrom } from 'rxjs';
import { RegistrationRelayOutput } from '../output/registration-relay-output';
import {
  UpdateRegistrationRelayMutationArgs,
  UpdateRegistrationRelayMutationRoot,
} from '../queries-and-mutations/registration-relay';
import { CatchError } from '../../common/catch-error';
import { HelperCheck } from '../../common/helper';

export class RegistrationRelayChangeable extends Changeable<RegistrationRelayOutput> {
  address: string;
  get hasAddressChanged(): boolean {
    return this.original.address !== this.address;
  }

  get isAddressValid(): boolean {
    return HelperCheck.isValidRelayAddress(this.address);
  }

  get invalidRelayAddressMessage(): string {
    return 'invalid relay address';
  }

  activity = false;

  constructor(
    registrationRelay: RegistrationRelayOutput,
    private _apollo: Apollo
  ) {
    super(registrationRelay);
    this.address = registrationRelay.address;
  }

  async save() {
    if (!this.hasAddressChanged || !this.isAddressValid) {
      return;
    }

    try {
      this.activity = true;

      const variables: UpdateRegistrationRelayMutationArgs = {
        registrationRelayId: this.original.id,
        address: this.address,
      };

      const result = await firstValueFrom(
        this._apollo.mutate<UpdateRegistrationRelayMutationRoot>({
          mutation: gql`
            mutation UpdateRegistrationRelay(
              $registrationRelayId: String!
              $address: String!
            ) {
              updateRegistrationRelay(
                registrationRelayId: $registrationRelayId
                address: $address
              ) {
                id
                address
              }
            }
          `,
          variables,
          fetchPolicy: 'network-only',
        })
      );
      //this.resetTo(result.data?.updateRegistrationRelay);
    } catch (error) {
      const message = new CatchError(error);
      console.log(message);
    } finally {
      this.activity = false;
    }
  }

  static createMany(
    registrationRelays: RegistrationRelayOutput[],
    apollo: Apollo
  ): RegistrationRelayChangeable[] {
    const changeables: RegistrationRelayChangeable[] = [];

    for (const x of registrationRelays) {
      changeables.push(new RegistrationRelayChangeable(x, apollo));
    }

    return changeables;
  }
}
