import { Injectable } from '@angular/core';

const LOCAL_STORAGE = {
  LOGIN_PUBKEY: 'login-pubkey',
  LOGIN_RELAY: 'login-relay',
  REGISTER_PUBKEY: 'register-pubkey',
  REGISTER_RELAY: 'register-relay',
  DEVICE_ID: 'device-id',
};

const deprecatedLocalStorageNames = [
  'login-npub',
  'login-relay-short',
  'register-npub',
  'register-relay-short',
];

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {
    // Clear local storage from deprecated names.
    deprecatedLocalStorageNames.forEach((x) => localStorage.removeItem(x));
  }

  // #region Public Methods

  storeDeviceId(deviceId: string | null) {
    if (deviceId) {
      localStorage.setItem(LOCAL_STORAGE.DEVICE_ID, deviceId);
    }
  }

  readDeviceId(): string | null {
    return localStorage.getItem(LOCAL_STORAGE.DEVICE_ID);
  }

  storeLoginData(pubkey: string | null, relay: string | null) {
    if (pubkey) {
      localStorage.setItem(LOCAL_STORAGE.LOGIN_PUBKEY, pubkey);
    }

    if (relay) {
      localStorage.setItem(LOCAL_STORAGE.LOGIN_RELAY, relay);
    }
  }

  readLoginData() {
    const data = {
      pubkey: localStorage.getItem(LOCAL_STORAGE.LOGIN_PUBKEY),
      relay: localStorage.getItem(LOCAL_STORAGE.LOGIN_RELAY),
    };

    return data;
  }

  storeRegisterDataPubkey(pubkey: string | null) {
    if (pubkey) {
      localStorage.setItem(LOCAL_STORAGE.REGISTER_PUBKEY, pubkey);
    }
  }

  storeRegisterDataRelay(relay: string | null) {
    if (relay) {
      localStorage.setItem(LOCAL_STORAGE.REGISTER_RELAY, relay);
    }
  }

  readRegisterData() {
    return {
      pubkey: localStorage.getItem(LOCAL_STORAGE.REGISTER_PUBKEY),
      relay: localStorage.getItem(LOCAL_STORAGE.REGISTER_RELAY),
    };
  }

  // #endregion Public Methods
}
