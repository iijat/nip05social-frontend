import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_REGISTRATION_RELY = gql`
  fragment FullFragmentRegistrationRelay on RegistrationRelayOutput {
    id
    registrationId
    address
  }
`;
