import { PromoCodeOutput } from '../output/promo-code-output';

export type AdmPromoCodesQueryRoot = {
  admPromoCodes: PromoCodeOutput[];
};

export type AdmCreatePromoCodeMutationArgs = {
  sats: number;
  validityInDays: number;
  pubkey?: string | null;
  info?: string | null;
};

export type AdmCreatePromoCodeMutationRoot = {
  admCreatePromoCode: PromoCodeOutput;
};

export type AdmDeletePromoCodeMutationArgs = {
  id: number;
};

export type AdmDeletePromoCodeMutationRoot = {
  admDeletePromoCode: boolean;
};
