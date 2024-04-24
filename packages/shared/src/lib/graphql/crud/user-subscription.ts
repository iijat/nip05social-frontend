import { UserSubscriptionOutput } from '../output/user-subscription-output';

export type MyUserSubscriptionsQueryRoot = {
  myUserSubscriptions: UserSubscriptionOutput[];
};

export type CancelPendingUserSubscriptionMutationArgs = {
  userSubscriptionId: number;
};

export type CancelPendingUserSubscriptionMutationRoot = {
  cancelPendingUserSubscription: UserSubscriptionOutput;
};
