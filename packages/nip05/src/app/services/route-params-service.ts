import { Injectable } from '@angular/core';
import { v4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class RouteParamsService {
  readonly safe = new Map<string, any>();

  store(value: any): string {
    const key = v4().slice(0, 8);
    this.safe.set(key, value);
    return key;
  }

  unstore(key: string): boolean {
    return this.safe.delete(key);
  }
}
