import { UserSubscriptionInvoiceOutput } from './user-subscription-invoice-output';

export type UserSubscriptionInvoicePaymentOutput = {
  id: number;
  userSubscriptionInvoiceId: number;
  settled: boolean | null;
  settledAt: Date | null;

  // Relations
  userSubscriptionInvoice?: UserSubscriptionInvoiceOutput;
};
