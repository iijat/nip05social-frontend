import { RegistrationOutput } from './registration-output';

export interface RegistrationCodeOutput {
  id: string;
  registrationId: string;
  code: string;
  createdAt: string;
  validUntil: string;

  // Model Relations
  registration: RegistrationOutput;
}
