import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  // #region In/Out

  @Input() icon?: string;
  @Input() link?: string;
  @Input() href?: string;

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

  @HostBinding('tabindex') tabindex = 0;

  // #endregion In/Out

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
}
