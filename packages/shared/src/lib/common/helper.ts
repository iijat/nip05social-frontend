import { AbstractControl, ValidationErrors } from '@angular/forms';

export class HelperValidators {
  static isRelayAddress(control: AbstractControl): ValidationErrors | null {
    const message = `Invalid relay address ('wss://...').`;

    const address = control.value;

    if (typeof address === 'undefined') {
      return { message };
    }

    if (address === null) {
      return { message };
    }

    const regExp = /^wss:\/\/[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!regExp.test(address)) {
      return { message };
    }

    return null;
  }
}

export class HelperCheck {
  static isValidRelayAddress(address: string | undefined | null): boolean {
    if (!address) {
      return false;
    }

    const regExp = /^wss:\/\/[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    return regExp.test(address);
  }

  static isValidLightningAddress(address: string | undefined | null): boolean {
    if (!address) {
      return false;
    }

    const regExp = /^[\w-\.]+@([\w-]+\.)+[A-Z]{2,}$/i;

    return regExp.test(address);
  }
}
