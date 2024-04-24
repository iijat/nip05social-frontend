import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_NOSTR_EVENT = gql`
  fragment FullFragmentNostrEvent on NostrEventOutput {
    id
    pubkey
    createdAt
    kind
    value
    isEot
  }
`;
