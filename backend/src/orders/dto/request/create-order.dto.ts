import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { CreateOrdersDetailDto } from 'src/orders-detail/dto';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  supplierId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrdersDetailDto)
  details!: CreateOrdersDetailDto[];
}
