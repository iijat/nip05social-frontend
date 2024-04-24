import { RegistrationCodeOutput } from './registration-code-output';
import { RegistrationRelayOutput } from './registration-relay-output';
import { SystemDomainOutput } from './system-domain-output';
import { UserOutput } from './user-output';

export interface RegistrationOutput {
  id: string;
  userId: string;
  identifier: string;
  createdAt: string;
  validUntil: string;
  verifiedAt: string | null;
  nipped: number;
  systemDomainId: number;
  lastLookupDate?: string | null;
  lightningAddress?: string | null;
  emailForwardingOn?: boolean;
  emailOut: boolean;
  emailOutSubject: string;

  // Model Relations
  user: UserOutput;
  registrationCode: RegistrationCodeOutput | null;
  registrationRelays: RegistrationRelayOutput[];
  systemDomain: SystemDomainOutput;
}
