export class HelperNostr {
  static reducePubkey(pubkey: string | undefined) {
    if (!pubkey) {
      return undefined;
    }
    return (
      pubkey.slice(0, 8) +
      ':' +
      pubkey.slice(pubkey.length - 1 - 8, pubkey.length - 1)
    );
  }
}
