import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';

export class QueryParamsSales extends QueryParams {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  clientId?: number;
}
