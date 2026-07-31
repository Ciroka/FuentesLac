import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { CreateProductionSupplyDto } from './create-production-supply.dto';

export class CreateProductionDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  productId!: number;

  @IsDateString()
  @IsOptional()
  clientBatchDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductionSupplyDto)
  details!: CreateProductionSupplyDto[];
}
