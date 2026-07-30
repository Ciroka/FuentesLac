import { UserRole } from '../../../shared/enums';

export interface UserLoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
}
