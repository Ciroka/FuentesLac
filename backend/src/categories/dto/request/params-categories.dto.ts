import { IsEnum, IsIn, IsOptional } from 'class-validator';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { SortByCategory } from '../../enums/sort-by.enum';

export class QueryParamsCategories extends QueryParams {
  @IsOptional()
  @IsEnum(SortByCategory)
  sortBy?: SortByCategory;

  /** Limita el resultado a categorías que tengan al menos un producto/insumo asociado. */
  @IsOptional()
  @IsIn(['products', 'supplies'])
  usedBy?: 'products' | 'supplies';
}
