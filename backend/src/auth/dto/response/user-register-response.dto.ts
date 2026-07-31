import { UserRole } from '../../../shared/enums';

export interface UserRegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
}
