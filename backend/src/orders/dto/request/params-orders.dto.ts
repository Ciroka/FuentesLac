import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';

export class QueryParamsOrders extends QueryParams {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  supplierId?: number;
}
