import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UserResetPasswordRequest {
    @IsString()
    @IsNotEmpty()
    token!: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;
}