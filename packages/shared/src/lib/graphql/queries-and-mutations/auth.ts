import { UserTokenOutput } from '../output/user-token-output';

export interface IsAuthenticatedQueryRoot {
  isAuthenticated: UserTokenOutput | null;
}
