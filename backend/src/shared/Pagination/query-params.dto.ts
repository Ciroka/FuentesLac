import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrderEnum } from '../enums/order.enum';
import { Type } from 'class-transformer';

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
  @Max(100)
  @IsOptional()
  limit: number = 10;
}
