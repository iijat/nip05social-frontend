export type AdmSendDMQueryArgs = {
  toPubkey: string;
  text: string;
  from: 'admin' | 'chris';
};

export type AdmSendDMQueryRoot = {
  admSendDM: string[];
};
