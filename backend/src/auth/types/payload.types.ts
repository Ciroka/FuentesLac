import { UserRole } from '../../shared/enums';

export type Payload = {
    sub: string;
    role: UserRole;
};