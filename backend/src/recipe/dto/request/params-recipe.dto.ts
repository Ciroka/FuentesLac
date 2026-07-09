import { IsOptional, IsString } from 'class-validator';

import { QueryParams } from '../../../shared/pagination/query-params.dto';

export class QueryParamsRecipe extends QueryParams {
  @IsOptional()
  @IsString()
  description?: string;
}
