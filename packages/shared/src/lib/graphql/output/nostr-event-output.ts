export type NostrEventOutput = {
  pubkey: string;
  isEot: boolean;

  id?: string;
  createdAt?: number;
  kind?: number;
  value?: string;
};
