import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorHandling } from '../../helpers/error-handling';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CatchError } from 'shared';

export type ConfirmDialogData = {
  title?: string;
  text: string;
  onConfirm?: () => Promise<void>;
};

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  // #region Public Properties

  activity = false;
  errorMessage = '';

  // #endregion Public Properties

  // #region Private Properties

  private _unsubscriber: Subject<void> = new Subject<void>();

  // #endregion Private Properties

  // #region Init

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private _dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  ngOnInit(): void {
    history.pushState(null, '');

    fromEvent(window, 'popstate')
      .pipe(takeUntil(this._unsubscriber))
      .subscribe((_) => {
        history.pushState(null, '');
      });
  }

  ngOnDestroy(): void {
    this._unsubscriber.next();
    this._unsubscriber.complete();
  }

  // #endregion Init

  // #region Public Methods

  cancel() {
    this._dialogRef.close(false);
  }

  async ok() {
    if (typeof this.data.onConfirm === 'undefined') {
      this._dialogRef.close(true);
    }

    try {
      this.activity = true;
      this.errorMessage = '';
      await this.data.onConfirm?.call(null);
      this._dialogRef.close(true);
    } catch (error) {
      this.errorMessage = new CatchError(error).message;
    } finally {
      this.activity = false;
    }
  }

  // #endregion Public Methods
}
