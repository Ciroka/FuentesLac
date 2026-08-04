import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalesDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  batchId!: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  weight?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  unitPrice?: number;
}
