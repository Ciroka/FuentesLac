import { IsEnum, IsOptional } from "class-validator";
import { QueryParams } from "src/shared/Pagination/query-params.dto";
import { SortByCategory } from "../enums/sort-by.enum";


export class QueryParamsCategories extends QueryParams {

    @IsEnum(SortByCategory)
    @IsOptional()
    sortBy?: SortByCategory;
}