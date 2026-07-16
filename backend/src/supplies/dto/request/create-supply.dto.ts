import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateSupplyDto {
  @IsString()
  name!: string;

  @IsPositive()
  @IsNumber()
  costPrice!: number;

  @IsOptional()
  isMilk?: boolean = false;

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
