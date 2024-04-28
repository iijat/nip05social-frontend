import { UserOutput } from '../output/user-output';

export interface DeleteMyUserMutationRoot {
  deleteMyUser: string;
}

export interface MyUserQueryRoot {
  myUser: UserOutput | null; // null means that the user is unauthorized;
}
