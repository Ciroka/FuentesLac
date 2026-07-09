import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../../shared/enums';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  hashPassword!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
