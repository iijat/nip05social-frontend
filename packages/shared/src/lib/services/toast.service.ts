import { Injectable } from '@angular/core';

enum ToastType {
  Info,
  Warning,
  Error,
}

interface ToastEvent {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  staysOpen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // #region Public Properties

  toastEvents: ToastEvent[] = [];

  // #endregion Public Properties

  // #region Private Properties

  #isHandset = true;
  #counter = 0;
  #delayInfo = 4000;
  #delayWarning = 5000;
  #delayError = 6000;

  // #endregion Private Properties

  constructor() {
    //this.error('The provided code does not match the one we sent to you.', 'Error', true);
    // this.error('This is a test warning', 'Error2', true);
  }

  // #region Public Methods

  setIsHandset(isHandset: boolean) {
    this.#isHandset = isHandset;
  }

  info(message: string, title?: string, staysOpen = false) {
    const event: ToastEvent = {
      id: this.#counter++,
      type: ToastType.Info,
      message,
      title,
      staysOpen,
    };
    this.toastEvents.push(event);

    this._setTimeout(event);
  }

  warning(message: string, title?: string, staysOpen = false) {
    const event: ToastEvent = {
      id: this.#counter++,
      type: ToastType.Warning,
      message,
      title,
      staysOpen,
    };
    this.toastEvents.push(event);

    this._setTimeout(event);
  }

  error(message: string, title?: string) {
    const staysOpen = this.#isHandset;
    const event: ToastEvent = {
      id: this.#counter++,
      type: ToastType.Error,
      message,
      title,
      staysOpen,
    };
    this.toastEvents.push(event);

    this._setTimeout(event);
  }

  keepOpen(event: ToastEvent) {
    const index = this.toastEvents.findIndex((x) => x.id === event.id);
    if (index === -1) {
      return;
    }

    this.toastEvents[index].staysOpen = true;
  }

  close(event: ToastEvent) {
    const index = this.toastEvents.findIndex((x) => x.id === event.id);
    if (index === -1) {
      return;
    }

    this.toastEvents.splice(index, 1);
  }

  // #endregion Public Methods

  // #region Private Methods

  private _setTimeout(event: ToastEvent) {
    let delay = 4000;

    switch (event.type) {
      case ToastType.Info:
        delay = this.#delayInfo;
        break;

      case ToastType.Warning:
        delay = this.#delayWarning;
        break;

      case ToastType.Error:
        delay = this.#delayError;
        break;

      default:
        break;
    }

    window.setTimeout(() => {
      if (event.staysOpen) {
        return;
      }

      const index = this.toastEvents.findIndex((x) => x.id === event.id);
      if (index === -1) {
        return;
      }

      this.toastEvents.splice(index, 1);
    }, delay);
  }

  // #endregion Private Methods
}
