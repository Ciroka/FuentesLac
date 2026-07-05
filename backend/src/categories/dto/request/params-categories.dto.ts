import { IsEnum, IsOptional } from 'class-validator';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { SortByCategory } from '../../enums/sort-by.enum';

export class QueryParamsCategories extends QueryParams {
  @IsOptional()
  @IsEnum(SortByCategory)
  sortBy?: SortByCategory;
}
