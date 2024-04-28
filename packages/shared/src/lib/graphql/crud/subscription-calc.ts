import { SubscriptionCalcOutput } from '../output/subscription-calc-output';

export type SubscriptionCalcQueryArgs = {
  subscriptionId: number;
  days: number;
  promoCode: string | null;
};

export type SubscriptionCalcQueryRoot = {
  subscriptionCalc: SubscriptionCalcOutput;
};
