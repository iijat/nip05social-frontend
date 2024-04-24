import { RegistrationRelayOutput } from '../output/registration-relay-output';

export type AddRegistrationRelayMutationArgs = {
  registrationId: string;
  relay?: string | null;
};

export type AddRegistrationRelayMutationRoot = {
  addRegistrationRelay: RegistrationRelayOutput;
};

export type DeleteRegistrationRelayMutationArgs = {
  registrationRelayId: string;
};

export type DeleteRegistrationRelayMutationRoot = {
  deleteRegistrationRelay: boolean;
};

export interface UpdateRegistrationRelayMutationRoot {
  updateRegistrationRelay: RegistrationRelayOutput;
}

export interface UpdateRegistrationRelayMutationArgs {
  registrationRelayId: string;
  address: string;
}
