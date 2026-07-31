import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { SortByProduct } from '../../enums/sort-by.enum';

export class QueryParamsProducts extends QueryParams {
  @IsOptional()
  @IsEnum(SortByProduct)
  sortBy?: SortByProduct;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId?: number;
}
