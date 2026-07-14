import { UserRole } from '../../../shared/enums';

export interface UserMeResponse {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
