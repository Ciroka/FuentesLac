import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

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
  @IsOptional()
  currentStock: number = 0;

  @IsPositive()
  @IsNumber()
  minStock!: number;

  @IsNumber()
  @IsOptional()
  batchId?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  categoryId?: number;
}
