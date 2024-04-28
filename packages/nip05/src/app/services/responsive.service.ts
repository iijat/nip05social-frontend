import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  private _isHandset = false;
  get isHandset() {
    return this._isHandset;
  }

  set(isHandset: boolean) {
    this._isHandset = isHandset;
  }
}
