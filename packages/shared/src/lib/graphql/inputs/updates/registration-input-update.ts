export type RegistrationInputUpdate = {
  lightningAddress: string | null;
  emailForwardingOn: boolean | null;
  emailOut: boolean;
  emailOutSubject: string;
};
