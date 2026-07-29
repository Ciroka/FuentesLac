import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

export class QueryParamsOrders extends QueryParams {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  supplierId?: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
