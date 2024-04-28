import { BotMetadataRelayOutput } from './bot-metadata-relay-output';

export type BotMetadataOutput = {
  id: number;
  createdAt: string;
  nip05: string;
  name: string;
  about: string | null;
  picture: string | null;
  banner: string | null;

  // Relations
  botMetadataRelays?: BotMetadataRelayOutput[] | null;
};
