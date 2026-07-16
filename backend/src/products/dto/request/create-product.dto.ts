import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsPositive()
  @IsNumber()
  costPrice!: number;

  @IsPositive()
  @IsNumber()
  marginPercent: number = 0.3;

  @IsPositive()
  @IsNumber()
  minStock!: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  categoryId?: number;
}