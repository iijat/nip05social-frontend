import { NostrEventOutput } from '../output/nostr-event-output';

export type ProfileQueryArgs = {
  pubkey?: string;
  nip05?: string;
  subscriptionId: string;
};

export type ProfileQueryRoot = {
  profile: NostrEventOutput | null;
};
