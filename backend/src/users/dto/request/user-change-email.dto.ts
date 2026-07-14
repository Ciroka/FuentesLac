import { IsEmail, IsString } from "class-validator";

export class UserChangeEmailDto {
    @IsString()
    @IsEmail()
    newEmail!: string;

    @IsString()
    password!: string;
}