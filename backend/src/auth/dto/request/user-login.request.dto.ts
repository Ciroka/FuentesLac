import { IsEmail, IsString } from 'class-validator';

export class UserLoginRequest {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}