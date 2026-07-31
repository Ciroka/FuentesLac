import { UserRole } from '../../../shared/enums';

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
