import { UserSubscriptionInvoicePaymentOutput } from './user-subscription-invoice-payment-output';
import { UserSubscriptionOutput } from './user-subscription-output';

export type UserSubscriptionInvoiceOutput = {
  id: number;
  userSubscriptionId: number;
  createdAt: string;
  amount: number;
  description: string | null;
  expiresAt: string;
  paymentHash: string;
  paymentRequest: string;
  qrCodePng: string;
  qrCodeSvg: string;

  // Relations
  userSubscription?: UserSubscriptionOutput;
  userSubscriptionInvoicePayment?: UserSubscriptionInvoicePaymentOutput | null;
};
