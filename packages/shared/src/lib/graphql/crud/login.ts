import { LoginViaDmOutput } from '../output/login-via-dm-output';
import { UserTokenOutput } from '../output/user-token-output';

export type CreateLoginNip07CodeMutationArgs = {
  pubkey: string;
};

export type CreateLoginNip07CodeMutationRoot = {
  createLoginNip07Code: string;
};

export type CreateLoginNip46CodeMutationArgs = {
  pubkey: string;
  deviceId: string;
};

export type CreateLoginNip46CodeMutationRoot = {
  createLoginNip46Code: string;
};

export interface CreateLoginCodeMutationArgs {
  pubkey: string;
  relay?: string;
  jobId: string;
}

export interface CreateLoginCodeMutationRoot {
  createLoginCode: string; // userId
}

export type RedeemLoginNip07CodeMutationArgs = {
  deviceId: string;
  data: {
    id: string;
    pubkey: string;
    created_at: number;
    sig: string;
    content: string;
    tags: string[][];
    kind: number;
  };
};

export type RedeemLoginNip07CodeMutationRoot = {
  redeemLoginNip07Code: UserTokenOutput;
};

export type RedeemLoginNip46CodeMutationArgs = {
  deviceId: string;
  data: {
    id: string;
    pubkey: string;
    created_at: number;
    sig: string;
    content: string;
    tags: string[][];
    kind: number;
  };
};

export type RedeemLoginNip46CodeMutationRoot = {
  redeemLoginNip46Code: UserTokenOutput;
};

export interface RedeemLoginCodeMutationArgs {
  userId: string;
  deviceId: string;
  code: string;
}

export interface RedeemLoginCodeMutationRoot {
  redeemLoginCode: UserTokenOutput;
}

export interface LoginViaDmMutationArgs {
  pubkey: string;
  relays: string[];
}

export type LoginViaDmMutationRoot = {
  loginViaDm: LoginViaDmOutput;
};

export type LoginViaDmRedeemMutationArgs = {
  userId: string;
  deviceId: string;
  code: string;
};

export type LoginViaDmRedeemMutationRoot = {
  loginViaDmRedeem: UserTokenOutput;
};

export type LoginViaExtensionMutationArgs = {
  pubkey: string;
  deviceId: string;
};

export type LoginViaExtensionMutationRoot = {
  loginViaExtension: string;
};

export type LoginViaExtensionRedeemMutationArgs = {
  deviceId: string;
  data: {
    id: string;
    pubkey: string;
    created_at: number;
    sig: string;
    content: string;
    tags: string[][];
    kind: number;
  };
};

export type LoginViaExtensionRedeemMutationRoot = {
  loginViaExtensionRedeem: UserTokenOutput;
};
