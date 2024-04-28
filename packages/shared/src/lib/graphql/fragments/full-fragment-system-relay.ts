import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_SYSTEM_RELAY = gql`
  fragment FullFragmentSystemRelay on SystemRelayOutput {
    id
    url
  }
`;
