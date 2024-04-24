import { PublicRelayOutput } from '../output/public-relay-output';

export type AdmCreatePublicRelayMutationArgs = {
  url: string;
  notes: string | null;
};

export type AdmCreatePublicRelayMutationRoot = {
  admCreatePublicRelay: PublicRelayOutput;
};

export type AdmUpdatePublicRelayMutationArgs = {
  id: number;
  data: {
    url: string | null;
    notes: string | null;
    isActive: boolean | null;
  };
};

export type AdmUpdatePublicRelayMutationRoot = {
  admUpdatePublicRelay: PublicRelayOutput;
};

export type PublicRelaysQueryRoot = {
  publicRelays: PublicRelayOutput[];
};
