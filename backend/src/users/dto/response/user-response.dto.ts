import { UserRole } from '../../../shared/enums';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
