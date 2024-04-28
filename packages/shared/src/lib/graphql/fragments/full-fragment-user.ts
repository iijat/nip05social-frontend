import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_USER = gql`
  fragment FullFragmentUser on UserOutput {
    id
    pubkey
    npub
    createdAt
    isSystemUser
    subscriptionEnd
    subscriptionId
    lastSeenNip05
    lastSeenNip05At
    lastSeenNip05Event
  }
`;
