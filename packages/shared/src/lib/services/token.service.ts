import { Injectable } from '@angular/core';
import { UserTokenOutput } from '../graphql/output/user-token-output';

class Token {
  id: string;
  userId: string;
  deviceId: string;
  token: string;
  validUntil: Date;

  constructor(userTokenOutput: UserTokenOutput) {
    this.id = userTokenOutput.id;
    this.userId = userTokenOutput.userId;
    this.deviceId = userTokenOutput.deviceId;
    this.token = userTokenOutput.token;
    this.validUntil = new Date(userTokenOutput.validUntil);
  }

  isValid(): boolean {
    return Date.now() <= this.validUntil.getDate();
  }
}

const LOCAL_STORAGE = {
  USER_TOKEN_OUTPUT: 'userTokenOutput',
};

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private _token: Token | undefined;
  get token(): Token | undefined {
    return this._token;
  }

  constructor() {
    const userTokenOutput = this._readFromLocalStorage();
    if (!userTokenOutput) {
      return;
    }

    this._token = new Token(userTokenOutput);
  }

  setToken(userTokenOutput: UserTokenOutput | undefined) {
    if (!userTokenOutput) {
      this._token = undefined;
      return;
    }

    this._token = new Token(userTokenOutput);
    this._writeToLocalStorage(userTokenOutput);
  }

  unsetToken() {
    this._token = undefined;
    localStorage.removeItem(LOCAL_STORAGE.USER_TOKEN_OUTPUT);
  }

  _writeToLocalStorage(userTokenOutput: UserTokenOutput) {
    localStorage.setItem(
      LOCAL_STORAGE.USER_TOKEN_OUTPUT,
      JSON.stringify(userTokenOutput)
    );
  }

  _readFromLocalStorage(): UserTokenOutput | null {
    const userTokenOutputString = localStorage.getItem(
      LOCAL_STORAGE.USER_TOKEN_OUTPUT
    );
    if (!userTokenOutputString) {
      return null;
    }
    return JSON.parse(userTokenOutputString) as UserTokenOutput;
  }
}
