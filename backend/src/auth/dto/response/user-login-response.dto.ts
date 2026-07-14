import { UserRole } from '../../../shared/enums';

export interface UserLoginResponse {
    user: {
        id: string;
        email: string;
        role: UserRole;
        createdAt: Date;
    };
    access_token: string;
}