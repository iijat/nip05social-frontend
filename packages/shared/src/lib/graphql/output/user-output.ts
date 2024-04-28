import { RegistrationOutput } from './registration-output';
import { SubscriptionOutput } from './subscription-output';
import { UserSubscriptionOutput } from './user-subscription-output';

export interface UserOutput {
  id: string;
  pubkey: string;
  npub: string;
  createdAt: string;
  isSystemUser?: boolean;
  subscriptionId: number;
  subscriptionEnd: string | null;
  lastSeenNip05: string | null;
  lastSeenNip05At: string | null;
  lastSeenNip05Event: string | null;

  // Relations
  registrations: RegistrationOutput[] | null;
  subscription: SubscriptionOutput;
  userSubscriptions: UserSubscriptionOutput[];
}
