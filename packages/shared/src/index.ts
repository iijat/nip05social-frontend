import { CatchError } from './lib/common/catch-error';
import { sleep } from './lib/common/sleep';
//import { Token, IToken } from './lib/services/token.service';
import {
  NostrEventKind,
  NostrUnsignedEvent,
  NostrEvent,
  NostrEventKind0Content,
} from './lib/nostr/typeDefs';

export * from './lib/shared.module';

export { CatchError };
export { sleep };
//export { Token, IToken };
export {
  NostrEventKind,
  NostrUnsignedEvent,
  NostrEvent,
  NostrEventKind0Content,
};
export { Loading } from './lib/common/loading';
