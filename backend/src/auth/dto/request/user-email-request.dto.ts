import { IsEmail, IsString } from "class-validator";

export class UserEmailRequest {
    @IsString()
    @IsEmail()
    email!: string;
}