import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TokenService } from 'packages/shared/src/lib/services/token.service';

@Component({
  selector: 'app-handset-menu-dialog',
  templateUrl: './handset-menu-dialog.component.html',
  styleUrls: ['./handset-menu-dialog.component.scss'],
})
export class HandsetMenuDialogComponent {
  // #region Init

  constructor(
    public _dialogRef: MatDialogRef<HandsetMenuDialogComponent>,
    public tokenService: TokenService
  ) {}

  // #endregion Init

  // #region Public Methods

  action(event: string) {
    this._dialogRef.close(event);
  }

  // #endregion Public Methods
}
