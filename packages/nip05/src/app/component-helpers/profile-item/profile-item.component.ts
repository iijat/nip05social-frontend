import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-profile-item',
  templateUrl: './profile-item.component.html',
  styleUrls: ['./profile-item.component.scss'],
})
export class ProfileItemComponent {
  // #region In/Out

  @Input() icon!: string;
  @Input() text!: string;
  @Input() copy2ClipboardText: string | undefined;
  @Input() suffix: string | undefined;

  // #endregion In/Out

  // #region Public Properties

  showCopy2ClipboardText = false;

  // #endregion Public Properties

  // #region Init

  constructor(private _clipboard: Clipboard) {}

  // #endregion Init

  // #region Public Methods

  copyToClipboard() {
    this.showCopy2ClipboardText = true;

    if (this.copy2ClipboardText) {
      this._clipboard.copy(this.copy2ClipboardText);
    } else {
      this._clipboard.copy(this.text);
    }

    window.setTimeout(() => {
      this.showCopy2ClipboardText = false;
    }, 800);
  }

  // #endregion Public Methods
}
