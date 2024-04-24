import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_SUBSCRIPTION = gql`
  fragment FullFragmentSubscription on SubscriptionOutput {
    id
    name
    satsPer30Days
    maxNoOfNostrAddresses
    maxNoOfInboundEmailsPer30Days
    maxNoOfOutboundEmailsPer30Days
  }
`;
