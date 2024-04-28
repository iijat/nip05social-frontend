import { Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-relay-quote',
  templateUrl: './relay-quote.component.html',
  styleUrls: ['./relay-quote.component.scss'],
})
export class RelayQuoteComponent {
  private _aTextDefault = 'wss://nostr-pub.wellorder.net';

  aText = this._aTextDefault;

  constructor(private _clipboard: Clipboard) {}

  onClickA() {
    this.aText = '( copied to clipboard )';
    this._clipboard.copy(this._aTextDefault);
    setTimeout(() => {
      this.aText = this._aTextDefault;
    }, 1500);
  }
}
