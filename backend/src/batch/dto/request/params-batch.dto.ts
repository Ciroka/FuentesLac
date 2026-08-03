import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { SortByBatch } from '../../enums/sort-by.enum';

export class QueryParamsBatch extends QueryParams {
  @IsOptional()
  @IsEnum(SortByBatch)
  sortBy?: SortByBatch;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  productId?: number;
}
