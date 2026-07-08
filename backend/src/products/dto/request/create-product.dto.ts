import {
  IsDecimal,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsPositive()
  @IsDecimal()
  @IsOptional()
  salePrice?: number;

  @IsPositive()
  @IsDecimal()
  costPrice!: number;

  @IsPositive()
  @IsDecimal()
  marginPercent: number = 0.3;

  @IsPositive()
  @IsDecimal()
  @IsOptional()
  currentStock: number = 0;

  @IsPositive()
  @IsDecimal()
  minStock!: number;

  @IsNumber()
  @IsOptional()
  lote?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  categoryId?: number;
}
