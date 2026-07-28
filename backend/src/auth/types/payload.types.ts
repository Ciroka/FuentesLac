import { UserRole } from '../../shared/enums';

export type Payload = {
  sub: string;
  role: UserRole;
};

export type AuthResult = {
  user: {
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
  access_token: string;
  refresh_token: string;
};
