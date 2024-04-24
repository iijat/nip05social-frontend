import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_USER_SUBSCRIPTION_INVOICE = gql`
  fragment FullFragmentUserSubscriptionInvoice on UserSubscriptionInvoiceOutput {
    id
    userSubscriptionId
    createdAt
    amount
    description
    expiresAt
    paymentHash
    paymentRequest
    qrCodePng
    qrCodeSvg
  }
`;
