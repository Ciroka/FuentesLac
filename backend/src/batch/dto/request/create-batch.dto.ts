import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBatchDto {
  @IsInt()
  @IsOptional()
  yield?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  productId!: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  milkLitersUsed?: number;

  @IsDateString()
  @IsOptional()
  clientBatchDate?: string;
}
