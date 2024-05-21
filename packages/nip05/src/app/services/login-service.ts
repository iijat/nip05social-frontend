import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {
  LoginViaDmMutationArgs,
  LoginViaDmMutationRoot,
} from 'packages/shared/src/lib/graphql/crud/login';
import { LoginViaDmOutput } from 'packages/shared/src/lib/graphql/output/login-via-dm-output';
import { NostrHelperV2 } from 'packages/shared/src/lib/nostr/nostrHelperV2';
import { firstValueFrom } from 'rxjs';

interface Nip05 {
  names?: { [key: string]: string };
  relays?: { [key: string]: string[] };
}

interface ExtendedNip05 {
  fullIdentifier: string;
  pubkey: string;
  relays: string[];
}

const LOCAL_STORAGE_RELAYS = 'relays';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient, private apollo: Apollo) {}

  async loginViaDm(userCredentials: string): Promise<LoginViaDmOutput> {
    let pubkey = '';
    let relays: string[] = [];

    if (userCredentials.includes('@')) {
      // The user credentials are a nostr address.

      const eNip05 = await this.#queryNip05(userCredentials);
      if (!eNip05) {
        throw new Error(
          `NIP-05 query error. Could not retrieve pubkey for '${userCredentials}'.`
        );
      }

      pubkey = eNip05.pubkey;
      relays = Array.from(
        new Set<string>([...eNip05.relays, ...this.#getLocalStorageRelays()])
      );
    } else {
      // The user credentials are a pubkey (npub or hex)

      const pubkeyObject = NostrHelperV2.getNostrPubkeyObject(userCredentials);
      pubkey = pubkeyObject.hex;
      relays = Array.from(new Set<string>(this.#getLocalStorageRelays()));
    }

    // Now, we have the pubkey and the relays.
    const variables: LoginViaDmMutationArgs = {
      pubkey,
      relays,
    };

    const result = await firstValueFrom(
      this.apollo.mutate<LoginViaDmMutationRoot>({
        mutation: gql`
          mutation LoginViaDm($pubkey: String!, $relays: [String!]!) {
            loginViaDm(pubkey: $pubkey, relays: $relays) {
              userId
              relays
            }
          }
        `,
        variables,
        fetchPolicy: 'no-cache',
      })
    );

    if (!result.data) {
      throw new Error(
        `Server error. Login code could not be generated for pubkey '${pubkey}'.`
      );
    }

    return result.data.loginViaDm;
  }

  async #queryNip05(
    fullIdentifier: string
  ): Promise<ExtendedNip05 | undefined> {
    const [identifier, domain] = fullIdentifier.split('@');
    if (!identifier || !domain) {
      return undefined;
    }

    const nip05 = (await firstValueFrom(
      this.http.get(
        `https://${domain}/.well-known/nostr.json?name=${identifier.toLowerCase()}`
      )
    )) as Nip05;

    if (
      Object.keys(nip05).length === 0 ||
      !nip05.names ||
      !nip05.names[identifier]
    ) {
      return undefined;
    }

    const result: ExtendedNip05 = {
      fullIdentifier: identifier.toLowerCase() + '@' + domain.toLowerCase(),
      pubkey: nip05.names[identifier.toLowerCase()],
      relays: [],
    };

    if (nip05.relays && nip05.relays[result.pubkey]) {
      result.relays = nip05.relays[result.pubkey];
    }

    return result;
  }

  #getLocalStorageRelays(): string[] {
    const relaysString = localStorage.getItem(LOCAL_STORAGE_RELAYS);
    if (!relaysString) {
      return [];
    }

    try {
      return JSON.parse(relaysString) as string[];
    } catch (error) {
      return [];
    }
  }
}
