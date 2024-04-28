import { UserOutput } from '../output/user-output';
import { UserSubscriptionOutput } from '../output/user-subscription-output';

export type CreateUserSubscriptionWithInvoiceMutationArgs = {
  subscriptionId: number;
  days: number;
  promoCode: string | null;
};

export type CreateUserSubscriptionWithInvoiceMutationRoot = {
  createUserSubscriptionWithInvoice: UserSubscriptionOutput;
};

export type CreateUserSubscriptionWithoutInvoiceMutationArgs = {
  subscriptionId: number;
  days: number;
};

export type CreateUserSubscriptionWithoutInvoiceMutationRoot = {
  createUserSubscriptionWithoutInvoice: UserOutput;
};
