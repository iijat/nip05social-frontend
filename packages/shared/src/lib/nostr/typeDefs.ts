import { NostrHelperV2 } from './nostrHelperV2';

export enum NostrEventKind {
  Metadata = 0,
  Text = 1,
  RecommendRelay = 2,
  Contacts = 3,
  EncryptedDirectMessage = 4,
  EventDeletion = 5,
  Reaction = 7,
  ChannelCreation = 40,
  ChannelMetadata = 41,
  ChannelMessage = 42,
  ChannelHideMessage = 43,
  ChannelMuteUser = 44,
}

export type NostrUnsignedEvent = {
  kind: NostrEventKind;
  tags: string[][];
  content: string;
  created_at: number;
};

export type NostrEvent = {
  id: string;
  sig: string;
  kind: NostrEventKind;
  tags: string[][];
  pubkey: string;
  content: string;
  created_at: number;
};

export type NostrEventKind0Content = {
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  username?: string;
  display_name?: string;
  displayName?: string;
  banner?: string;
  website?: string;
  lud16?: string; // lightning address
};

export class NostrEventWrapper<ContentType> {
  readonly pubkey: string;
  readonly pubkeyNpub: string;
  protected source: NostrEvent | undefined;

  get content(): ContentType | undefined {
    return typeof this.source === 'undefined'
      ? undefined
      : JSON.parse(this.source.content);
  }

  constructor(pubkey: string, source: NostrEvent | undefined) {
    this.pubkey = pubkey;
    this.source = source;

    this.pubkeyNpub = NostrHelperV2.pubkey2npub(pubkey);
  }

  update(source: NostrEvent) {
    this.source = source;
  }
}
