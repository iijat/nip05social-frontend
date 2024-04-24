import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResponsiveService } from '../../services/responsive.service';
import { HelperNostr } from '../../helpers/helper-nostr';
import { UserSubscriptionOutput } from 'packages/shared/src/lib/graphql/output/user-subscription-output';
import { UserSubscriptionInvoiceOutput } from 'packages/shared/src/lib/graphql/output/user-subscription-invoice-output';
import { UserSubscriptionInvoicePaymentOutput } from 'packages/shared/src/lib/graphql/output/user-subscription-invoice-payment-output';

export type AlbyInvoiceDialogResult = 'cancel-invoice';

export type AlbyInvoiceDialogData = {
  subscription: UserSubscriptionOutput;
  invoice: UserSubscriptionInvoiceOutput;
  payment: UserSubscriptionInvoicePaymentOutput | undefined;
};

@Component({
  selector: 'app-alby-invoice-dialog',
  templateUrl: './alby-invoice-dialog.component.html',
  styleUrls: ['./alby-invoice-dialog.component.scss'],
})
export class AlbyInvoiceDialogComponent implements OnInit {
  reducePubkey = HelperNostr.reducePubkey;
  invoiceStatus: 'cancelled' | 'paid' | 'expired' | 'unsettled' | undefined;
  get invoiceIsPaid() {
    return this.invoiceStatus === 'paid';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AlbyInvoiceDialogData,
    public responsiveService: ResponsiveService,
    private dialog: MatDialogRef<AlbyInvoiceDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.data.subscription.cancelled) {
      this.invoiceStatus = 'cancelled';
      return;
    }

    if (this.data.payment?.settled === true) {
      this.invoiceStatus = 'paid';
    } else {
      const now = Date.now();

      this.invoiceStatus =
        now > new Date(this.data.invoice.expiresAt).getTime()
          ? 'expired'
          : 'unsettled';
    }
  }

  close() {
    this.dialog.close(undefined);
  }

  cancelInvoice() {
    const reason: AlbyInvoiceDialogResult = 'cancel-invoice';
    this.dialog.close(reason);
  }
}
