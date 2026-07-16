import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';

export class QueryParamsAdjustments extends QueryParams {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  batchId?: number;
}
