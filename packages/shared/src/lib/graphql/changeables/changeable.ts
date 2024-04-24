export class Changeable<T> {
  get original() {
    return this._original;
  }
  private _original: T;

  constructor(original: T) {
    this._original = original;
  }

  protected resetTo(newOriginal: T | undefined) {
    if (!newOriginal) {
      return;
    }

    this._original = newOriginal;
  }
}
