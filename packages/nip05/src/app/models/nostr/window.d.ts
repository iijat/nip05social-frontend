import { NostrEvent, NostrUnsignedEvent } from './type-defs';

// now
// interface Window {
//   hallo: string;
//   nostr: string;
//   //   nostr: {
//   //     getPublicKey: () => Promise<string>;
//   //     signEvent: (event: NostrUnsignedEvent) => Promise<NostrEvent>;
//   //   };
// }

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: NostrUnsignedEvent) => Promise<NostrEvent>;
    };
  }
}
