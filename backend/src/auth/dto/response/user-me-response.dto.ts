import { UserRole } from '../../../shared/enums';

export interface UserMeResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
