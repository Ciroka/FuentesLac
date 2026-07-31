import { IsEmail, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsString()
  lastName!: string;

  @IsString()
  phone!: string;

  @IsString()
  cuit!: string;

  @IsEmail()
  email!: string;
}
