import { RegistrationInputUpdate } from '../inputs/updates/registration-input-update';
import { CreateRegistrationNip07CodeOutput } from '../output/createRegistrationNip07CodeOutput';
import { IdentifierRegisterCheckOutput } from '../output/identifier-register-check-output';
import { RegistrationOutput } from '../output/registration-output';
import { NostrAddressStatisticsOutput } from '../output/statistics/nostr-address-statistics-output';
import { UserTokenOutput } from '../output/user-token-output';

export interface CreateRegistrationCodeMutationArgs {
  name: string;
  systemDomainId: number;
  pubkey: string;
  jobId: string;
  relay?: string;
}

export interface CreateRegistrationCodeMutationRoot {
  createRegistrationCode: RegistrationOutput;
}

export type CreateRegistrationNip07CodeMutationArgs = {
  pubkey: string;
  name: string;
  systemDomainId: number;
};

export type CreateRegistrationNip07CodeMutationRoot = {
  createRegistrationNip07Code: CreateRegistrationNip07CodeOutput;
};

export interface DeleteRegistrationMutationRoot {
  deleteRegistration: string; // returns the id of the deleted record
}

export interface DeleteRegistrationMutationArgs {
  registrationId: string;
}

export type IsRegistrationAvailableQueryArgs = {
  name: string;
  systemDomainId: number;
};

export type IsRegistrationAvailableQueryRoot = {
  isRegistrationAvailable: IdentifierRegisterCheckOutput;
};

export interface MyRegistrationsQueryRoot {
  myRegistrations: RegistrationOutput[] | null; // null means that the user is unauthorized
}

export type NostrAddressStatisticsQueryRoot = {
  nostrAddressStatistics: NostrAddressStatisticsOutput;
};

export type NostrAddressStatisticsQueryArgs = {
  registrationId: string;
};

export interface RedeemRegistrationCodeMutationArgs {
  registrationId: string;
  userId: string;
  deviceId: string;
  code: string;
}

export interface RedeemRegistrationCodeMutationRoot {
  redeemRegistrationCode: UserTokenOutput;
}

export type ResendRegistrationCodeMutationArgs = {
  registrationId: string;
  userId: string;
  pubkey: string;
  relay?: string;
  jobId: string;
};

export type RedeemRegistrationNip07CodeMutationArgs = {
  deviceId: string;
  registrationId: string;
  data: {
    id: string;
    pubkey: string;
    created_at: number;
    sig: string;
    content: string;
    tags: string[][];
    kind: number;
  };
};

export type RedeemRegistrationNip07CodeMutationRoot = {
  redeemRegistrationNip07Code: UserTokenOutput;
};

export type ResendRegistrationCodeMutationRoot = {
  resendRegistrationCode: boolean;
};

export type UpdateRegistrationMutationRoot = {
  updateRegistration: RegistrationOutput;
};

export type UpdateRegistrationMutationArgs = {
  registrationId: string;
  data: RegistrationInputUpdate;
};
