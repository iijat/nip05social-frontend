import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_USER_SUBSCRIPTION = gql`
  fragment FullFragmentUserSubscription on UserSubscriptionOutput {
    id
    userId
    createdAt
    pending
    cancelled
    oldSubscriptionId
    newSubscriptionId
    newSubscriptionEnd
    info
  }
`;
