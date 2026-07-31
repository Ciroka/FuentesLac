import { IsEmail, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  address!: string;

  @IsString()
  cuit!: string;
}
