import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_REGISTRATION = gql`
  fragment FullFragmentRegistration on RegistrationOutput {
    id
    userId
    identifier
    createdAt
    validUntil
    verifiedAt
    nipped
    systemDomainId
    lastLookupDate
    lightningAddress
    emailForwardingOn
    emailOut
    emailOutSubject
  }
`;
