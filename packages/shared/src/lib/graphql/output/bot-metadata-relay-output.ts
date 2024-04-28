import { BotMetadataOutput } from './bot-metadata-output';

export type BotMetadataRelayOutput = {
  id: number;
  botMetadataId: number;
  publishedAt: string;
  url: string;

  // Relations
  botMetadata?: BotMetadataOutput;
};
