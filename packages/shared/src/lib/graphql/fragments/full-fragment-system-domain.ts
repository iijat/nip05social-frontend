import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_SYSTEM_DOMAIN = gql`
  fragment FullFragmentSystemDomain on SystemDomainOutput {
    id
    name
    order
  }
`;
