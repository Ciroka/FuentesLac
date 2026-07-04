import { IsEnum, IsOptional } from 'class-validator';
import { QueryParams } from 'src/shared/Pagination/query-params.dto';
import { SortByEnumProduct } from '../enums/sort-by.enum';

export class QueryParamsProducts extends QueryParams {
  @IsEnum(SortByEnumProduct)
  @IsOptional()
  sortBy?: SortByEnumProduct;
}
