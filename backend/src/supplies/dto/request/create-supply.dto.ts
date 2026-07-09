import {
  IsDecimal,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateSupplyDto {
  @IsString()
  name!: string;

  @IsPositive()
  @IsDecimal()
  costPrice!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  currentStock: number = 0;

  @IsInt()
  @Min(0)
  minStock!: number;

  @IsInt()
  @IsOptional()
  supplierId?: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
