import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_PROMO_CODE = gql`
  fragment FullFragmentPromoCode on PromoCodeOutput {
    id
    code
    sats
    createdAt
    validUntil
    pubkey
    info
  }
`;
