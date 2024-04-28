import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_BOT_METADATA = gql`
  fragment FullFragmentBotMetadata on BotMetadataOutput {
    id
    createdAt
    nip05
    name
    about
    picture
    banner
  }
`;
