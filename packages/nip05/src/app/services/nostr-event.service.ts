import { Injectable } from '@angular/core';
import {
  NostrEvent,
  NostrEventKind,
  NostrEventKind0Content,
  NostrEventWrapper,
} from '../models/nostr/type-defs';
import { Subject, firstValueFrom } from 'rxjs';
import { v4 } from 'uuid';
import { Apollo, gql } from 'apollo-angular';
import { NostrEventOutput } from 'packages/shared/src/lib/graphql/output/nostr-event-output';
import { FULL_FRAGMENT_NOSTR_EVENT } from 'packages/shared/src/lib/graphql/fragments/full-fragment-nostr-event';
import {
  ProfileQueryArgs,
  ProfileQueryRoot,
} from 'packages/shared/src/lib/graphql/crud/nostr-event';

export enum CustomEventType {
  isEot = 'isEot',
}

export type CustomEvent = {
  pubkey: string;
  type: CustomEventType;
};

@Injectable({
  providedIn: 'root',
})
export class NostrEventService {
  // #region Public Properties

  /**
   * A map holding all the loaded nostr events of kind 0.
   *
   * Key: pubkey
   *
   * Value: NostrEventWrapper
   */
  readonly profiles = new Map<
    string,
    NostrEventWrapper<NostrEventKind0Content>
  >();

  readonly eventNewProfile = new Subject<
    NostrEventWrapper<NostrEventKind0Content>
  >();

  readonly eventCustom = new Subject<CustomEvent>();

  // #endregion Public Properties

  // #region Private Properties

  private _subscriptionId = v4();

  // #endregion Private Properties

  constructor(private _apollo: Apollo) {}

  // #region Public Methods

  getCachedProfile(
    pubkey: string
  ): NostrEventWrapper<NostrEventKind0Content> | undefined {
    return this.profiles.get(pubkey);
  }

  queryProfileOnline(pubkey: string): void {
    this._queryProfileOnline(pubkey);
  }

  // #endregion Public Methods

  // #region Private Methods

  private _queryProfileOnline(pubkey: string) {
    const variables: ProfileQueryArgs = {
      pubkey,
      subscriptionId: this._subscriptionId,
    };

    firstValueFrom(
      this._apollo.query<ProfileQueryRoot>({
        query: gql`
          ${FULL_FRAGMENT_NOSTR_EVENT}
          query Profile(
            $subscriptionId: String!
            $pubkey: String
            $nip05: String
          ) {
            profile(
              subscriptionId: $subscriptionId
              pubkey: $pubkey
              nip05: $nip05
            ) {
              ...FullFragmentNostrEvent
            }
          }
        `,
        variables,
        fetchPolicy: 'no-cache',
      })
    )
      .then((result) => {
        if (result.data.profile) {
          this._handleNostrEventOutputFromApi(result.data.profile);
        }
      })
      .catch((error) => {
        // TODO
        console.log(error);
      });
  }

  private _handleNostrEventOutputFromApi(event: NostrEventOutput) {
    if (!event.value) {
      return; // will not happen
    }

    const nostrEvent = JSON.parse(event.value) as NostrEvent;

    // Handle nostr events
    // Currently only kind 0, ignore all other.
    if (nostrEvent.kind === NostrEventKind.Metadata) {
      let nostrEventWrapper = this.profiles.get(event.pubkey);
      if (typeof nostrEventWrapper !== 'undefined') {
        // The kind 0 event for the pubkey is already available => UPDATE
        nostrEventWrapper.update(nostrEvent);
      } else {
        // The kind 0 event for the pubkey is NOT available => ADD and INFORM
        nostrEventWrapper = new NostrEventWrapper(event.pubkey, nostrEvent);
        this.profiles.set(event.pubkey, nostrEventWrapper);
        this.eventNewProfile.next(nostrEventWrapper);
      }
    }
  }

  // #endregion Private Methods
}
