import { BotMetadataOutput } from '../output/bot-metadata-output';

export type AdmBotMetadatasQueryRoot = {
  admBotMetadatas: BotMetadataOutput[];
};

export type AdmCreateBotMetadataMutationArgs = {
  nip05: string;
  name: string;
  about: string | null;
  picture: string | null;
  banner: string | null;
};

export type AdmCreateBotMetadataMutationRoot = {
  admCreateBotMetadata: BotMetadataOutput;
};

export type AdmUpdateBotMetadataMutationArgs = {
  id: number;
  data: {
    nip05?: string;
    name?: string;
    about?: string | null;
    picture?: string | null;
    banner?: string | null;
  };
};

export type AdmUpdateBotMetadataMutationRoot = {
  admUpdateBotMetadata: BotMetadataOutput;
};

export type AdmPublishBotMetadataMutationArgs = {
  botMetadataId: number;
};

export type AdmPublishBotMetadataMutationRoot = {
  admPublishBotMetadata: BotMetadataOutput;
};
