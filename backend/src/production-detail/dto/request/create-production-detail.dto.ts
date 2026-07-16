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
import { CreateSuppliesXproductionDetailDto } from 'src/supplies-xproduction-detail/dto';

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
  @Type(() => CreateSuppliesXproductionDetailDto)
  details!: CreateSuppliesXproductionDetailDto[];
}