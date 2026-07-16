import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

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
}
