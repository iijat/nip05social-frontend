import { Component, HostBinding, Input, HostListener } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class ChipComponent {
  // #region In/Out

  @Input() text!: string;
  @Input() clipboardText: string | undefined;

  private _color?: string;
  @Input()
  get color() {
    return this._color;
  }
  set color(value: string | undefined) {
    switch (value) {
      case 'primary':
        this._isPrimary = true;
        this._isAccent = false;
        this._isWarn = false;
        this._isNon = false;
        break;

      case 'accent':
        this._isPrimary = false;
        this._isAccent = true;
        this._isWarn = false;
        this._isNon = false;
        break;

      case 'warn':
        this._isPrimary = false;
        this._isAccent = false;
        this._isWarn = true;
        this._isNon = false;
        break;

      default:
        this._isPrimary = false;
        this._isAccent = false;
        this._isWarn = false;
        this._isNon = true;
        break;
    }
  }

  private _disabled = false;
  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._isDisabled = value;
  }

  // #region Private Properties

  @HostBinding('class.disabled')
  private _isDisabled = false;

  @HostBinding('class.primary')
  private _isPrimary = false;

  @HostBinding('class.accent')
  private _isAccent = false;

  @HostBinding('class.warn')
  private _isWarn = false;

  @HostBinding('class.none')
  private _isNon = true;

  // #endregion Private Properties

  // #endregion In/Out

  // #region Public Properties

  showCopyToClipboard = false;

  // #endregion Public Properties

  constructor(private _clipboard: Clipboard) {}

  // #region Public Methods

  @HostListener('click', ['$event'])
  onClick(event: any) {
    if (this.clipboardText) {
      this._clipboard.copy(this.clipboardText);
    } else {
      this._clipboard.copy(this.text);
    }
    this.showCopyToClipboard = true;

    setTimeout(() => {
      this.showCopyToClipboard = false;
    }, 1500);
  }

  // #endregion Public Methods
}
