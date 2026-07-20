import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { OrderEnum } from '../enums/order.enum';

export class QueryParams {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(OrderEnum)
  @IsOptional()
  order: OrderEnum = OrderEnum.ASC;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Max(1000)
  @IsOptional()
  limit: number = 10;
}
