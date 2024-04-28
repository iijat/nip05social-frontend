import { SubscriptionOutput } from './subscription-output';
import { UserOutput } from './user-output';
import { UserSubscriptionInvoiceOutput } from './user-subscription-invoice-output';

export type UserSubscriptionOutput = {
  id: number;
  userId: string;
  createdAt: Date;
  pending: boolean;
  cancelled: boolean;
  oldSubscriptionId: number;
  newSubscriptionId: number;
  newSubscriptionEnd: Date | null;
  info: string | null;

  // Relations
  user?: UserOutput;
  oldSubscription?: SubscriptionOutput;
  newSubscription?: SubscriptionOutput;
  userSubscriptionInvoice?: UserSubscriptionInvoiceOutput | null;
};
