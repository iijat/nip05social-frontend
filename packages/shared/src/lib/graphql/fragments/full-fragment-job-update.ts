import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_JOB_UPDATE = gql`
  fragment FullFragmentJobUpdate on JobUpdateOutput {
    jobId
    relay
    success
    item
    ofItems
  }
`;
