import { IsString, MinLength } from "class-validator";

export class UserChangePasswordDto {
    @IsString()
    currentPassword!: string;

    @IsString()
    @MinLength(8)
    newPassword!: string;
}