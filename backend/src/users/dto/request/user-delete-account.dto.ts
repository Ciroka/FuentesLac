import { IsString } from "class-validator";

export class UserDeleteAccountDto {
    @IsString()
    password!: string;
}