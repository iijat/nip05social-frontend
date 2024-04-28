import EventEmitter = require('events');
import {
  getPublicKey,
  nip04,
  getEventHash,
  getSignature,
  UnsignedEvent,
  Event,
} from 'nostr-tools';
import { NostrFilters } from '../nostr/type-defs';
import { v4 } from 'uuid';
import { NostrEvent, NostrUnsignedEvent } from 'shared';

export enum NostrConnectAppEvent {
  IncomingConnectRequest = 'connect',
}

export enum Nip46RequestMethod {
  connect = 'connect',
  get_public_key = 'get_public_key',
  sign_event = 'sign_event',
  describe = 'describe',
}

export type Nip46Request = {
  id: string;

  // 'connect' -> incoming request from signer
  // 'get_public_key -> outgoing request from app
  method:
    | Nip46RequestMethod.connect
    | Nip46RequestMethod.get_public_key
    | Nip46RequestMethod.describe
    | string;
  params: any[];
};

export type Nip46Message = Nip46Request | Nip46Response;

export type Nip46Response = {
  id: string;
  result: any;
  error: string;
};

export class NostrWsAppIncomingEvent {
  readonly event: MessageEvent;
  readonly data: any[];

  get isEVENT(): boolean {
    return this.data[0] === 'EVENT' && this.data.length === 3;
  }

  get isOK(): boolean {
    return this.data[0] === 'OK' && this.data.length === 4;
  }

  get eventSubscriptionId(): string | undefined {
    return this.isEVENT ? (this.data[1] as string) : undefined;
  }

  get eventJson(): NostrEvent | undefined {
    return this.isEVENT ? (this.data[2] as NostrEvent) : undefined;
  }

  async getNip46Message(): Promise<Nip46Message | undefined> {
    if (this._decrypted) {
      return this._decrypted;
    }

    const eventJson = this.eventJson;
    if (!eventJson) {
      return undefined;
    }

    const decryptedString = await nip04.decrypt(
      this._appPrivkey,
      eventJson.pubkey,
      eventJson.content
    );
    this._decrypted = JSON.parse(decryptedString);
    return this._decrypted;
  }

  private _decrypted: Nip46Message | undefined;

  constructor(event: MessageEvent, private _appPrivkey: string) {
    this.event = event;

    if (!Array.isArray(JSON.parse(event.data))) {
      throw new Error('Websocket data could not be parsed into JSON.');
    }

    this.data = JSON.parse(event.data) as any[];
  }
}

export class NostrConnectApp {
  // #region Public Properties

  readonly events = new EventEmitter();

  // #endregion Public Properties

  // #region Private Properties

  private _relay: string;
  private _appPrivkey: string;
  private _appPubkey: string;
  private _ws: WebSocket | undefined;
  private _isWsOn = false;
  private _nip46SubscriptionId: string | undefined;
  private _signerPubkey: string | undefined;
  private _responseEvents = new EventEmitter();

  // #endregion Private Properties

  // #region Constructor

  constructor(relay: string, privkey: string) {
    this._relay = relay;
    this._appPrivkey = privkey;
    this._appPubkey = getPublicKey(privkey);
  }

  // #endregion Constructor

  // #region Public Methods

  async goOnline() {
    if (this._ws && this._ws.readyState === WebSocket.OPEN && this._isWsOn) {
      // The web socket connection is online and healthy.
      // Nothing to do here.
      return;
    }

    // Tear down the existing web socket connection (if available).
    this._wsOff();
    this._ws?.close();

    // Build up a new web socket connection

    this._ws = new WebSocket(this._relay);
    this._wsOn();
  }

  async goOffline() {
    if (!this._ws) {
      return;
    }

    this._ws.close();
    this._wsOff();
    this._ws = undefined;
  }

  /**
   * Queries the pubkey on the signer. Throws an exception in case no
   * response is received in time or in case an error message is received.
   * @param timeoutInMs (default 60000)
   * @returns
   */
  async getPublicKey(timeoutInMs: number | undefined = 60000): Promise<string> {
    const requestId = v4();

    this._publish(Nip46RequestMethod.get_public_key, [], requestId);

    return this._waitForResponse(requestId, timeoutInMs);
  }

  /**
   * Requests the signing of an unsigned event on the signer. Throws an
   * exception in case no response is received in time or in case an error
   * message is received.
   * @param unsignedEvent
   * @param timeoutInMs
   * @returns
   */
  async signEvent(
    event: UnsignedEvent,
    timeoutInMs: number | undefined = 60000
  ): Promise<Event> {
    const requestId = v4();

    this._publish(Nip46RequestMethod.sign_event, [event], requestId);

    return this._waitForResponse(requestId, timeoutInMs);
  }

  async describe(timeoutInMs: number | undefined = 60000): Promise<string[]> {
    const requestId = v4();

    this._publish(Nip46RequestMethod.describe, [], requestId);

    return this._waitForResponse(requestId, timeoutInMs);
  }

  private _waitForResponse(
    requestId: string,
    timeoutInMs: number | undefined = 60000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this._responseEvents.off('response', onFunction.bind(this));
        reject('No response received within timeout.');
        return;
      }, timeoutInMs);

      const onFunction = (response: Nip46Response) => {
        if (response.id !== requestId) {
          return; // not a response to our request
        }

        if (response.error) {
          window.clearTimeout(timeoutId);
          this._responseEvents.off('response', onFunction.bind(this));
          reject(response.error);
          return;
        } else {
          window.clearTimeout(timeoutId);
          this._responseEvents.off('response', onFunction.bind(this));
          resolve(response.result);
          return;
        }
      };

      this._responseEvents.on('response', onFunction.bind(this));
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private _wsOn() {
    // The subscription to web socket events should only occur once.
    if (this._isWsOn) {
      return;
    }

    this._ws?.addEventListener('open', this._wsOnOpen.bind(this));
    this._ws?.addEventListener('close', this._wsOnClose.bind(this));
    this._ws?.addEventListener('message', this._wsOnMessage.bind(this));
    this._ws?.addEventListener('error', this._wsOnError.bind(this));
  }

  private _wsOff() {
    this._ws?.removeEventListener('open', this._wsOnOpen.bind(this));
    this._ws?.removeEventListener('close', this._wsOnClose.bind(this));
    this._ws?.removeEventListener('message', this._wsOnMessage.bind(this));
    this._ws?.removeEventListener('error', this._wsOnError.bind(this));
    this._isWsOn = false;
  }

  private _wsOnOpen(event: any): void {
    // Subscribe to ...
    this._nip46SubscriptionId = v4();
    const filters: NostrFilters = {
      kinds: [24133],
      '#p': [this._appPubkey],
      since: Math.floor(Date.now() / 1000),
    };
    this._ws?.send(JSON.stringify(['REQ', this._nip46SubscriptionId, filters]));
  }

  private _wsOnClose(event: any): void {
    //
  }

  private async _wsOnMessage(event: MessageEvent): Promise<void> {
    // Only handle (relevant) EVENTs here.
    const nostrWsEvent = new NostrWsAppIncomingEvent(event, this._appPrivkey);

    const nip46Message = await nostrWsEvent.getNip46Message();
    if (!nip46Message) {
      return;
    }

    if (typeof (nip46Message as Nip46Request).method !== 'undefined') {
      // Message is Request
      const nip46Request = nip46Message as Nip46Request;
      // Could be a 'connect'

      if (nip46Request.method === 'connect') {
        // Store the pubkey of the signer
        this._signerPubkey = nip46Request.params[0];
        this.events.emit(
          NostrConnectAppEvent.IncomingConnectRequest,
          this._signerPubkey
        );
      }
    } else {
      // Message is Response
      const nip46Response = nip46Message as Nip46Response;
      this._responseEvents.emit('response', nip46Response);
    }
  }

  private _wsOnError(event: any): void {
    //
  }

  private async _publish(
    method: Nip46RequestMethod,
    params: any[],
    requestId: string | undefined = undefined
  ): Promise<string> {
    if (this._ws?.readyState !== WebSocket.OPEN) {
      throw new Error('Cannot publish anything. Websocket not ready.');
    }

    if (!this._signerPubkey) {
      throw new Error('Cannot publish anything. No signer pubkey available.');
    }

    if (!requestId) {
      requestId = v4();
    }
    const request: Nip46Request = {
      id: requestId,
      method,
      params,
    };
    console.log(request);

    const contentUnencrypted = JSON.stringify(request);
    const contentEncrypted = await nip04.encrypt(
      this._appPrivkey,
      this._signerPubkey,
      contentUnencrypted
    );
    const event: UnsignedEvent<24133> = {
      kind: 24133,
      pubkey: this._appPubkey,
      tags: [['p', this._signerPubkey]],
      created_at: Math.floor(Date.now() / 1000),
      content: contentEncrypted,
    };

    const id = getEventHash(event);
    const sig = getSignature(event, this._appPrivkey);

    const signedEvent = {
      id,
      sig,
      ...event,
    };

    this._ws.send(JSON.stringify(['EVENT', signedEvent]));
    return requestId;
  }

  // #endregion Private Methods
}
