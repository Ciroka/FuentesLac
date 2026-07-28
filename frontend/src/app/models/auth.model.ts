export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
