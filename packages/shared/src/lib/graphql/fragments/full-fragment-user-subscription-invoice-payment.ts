import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE_PAYMENT = gql`
  fragment FullFragmentUserSubscriptionInvoicePayment on UserSubscriptionInvoicePaymentOutput {
    id
    userSubscriptionInvoiceId
    settled
    settledAt
  }
`;
