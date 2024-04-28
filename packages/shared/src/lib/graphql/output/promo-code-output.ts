export type PromoCodeOutput = {
  id: number;
  code: string;
  sats: number;
  createdAt: string;
  validUntil: string;
  pubkey: string | null;
  info: string | null;
};
