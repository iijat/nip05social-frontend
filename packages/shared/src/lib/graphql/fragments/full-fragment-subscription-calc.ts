import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_SUBSCRIPTION_CALC = gql`
  fragment FullFragmentSubscriptionCalc on SubscriptionCalcOutput {
    subscriptionId
    subscriptionEnd
    amount
    promoAmount
    invoiceAmount
    days
  }
`;
