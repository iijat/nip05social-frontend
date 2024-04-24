import { gql } from 'apollo-angular';

export const FULL_FRAGMENT_BOT_METADATA_RELAY = gql`
  fragment FullFragmentBotMetadataRelay on BotMetadataRelayOutput {
    id
    botMetadataId
    publishedAt
    url
  }
`;
