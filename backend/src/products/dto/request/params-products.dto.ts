import { IsEnum, IsOptional } from 'class-validator';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { SortByProduct } from '../../enums/sort-by.enum';

export class QueryParamsProducts extends QueryParams {
  @IsOptional()
  @IsEnum(SortByProduct)
  sortBy?: SortByProduct;
}
