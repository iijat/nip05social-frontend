import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_PUBLIC_RELAY = gql`
  fragment FullFragmentPublicRelay on PublicRelayOutput {
    id
    isActive
    url
    createdAt
    notes
  }
`;
