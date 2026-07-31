import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalesDetailDto } from 'src/sales-detail/dto';

export class CreateSaleDto {
  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesDetailDto)
  details!: CreateSalesDetailDto[];
}
