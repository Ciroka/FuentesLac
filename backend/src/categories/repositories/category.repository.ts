import { PaginatedResult } from "src/shared/Pagination/pagination.type";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { CategoryEntity } from "../entities/category.entity"
import { OrderEnum } from "src/shared/enums/order.enum";
import { SortByCategory } from "../enums/sort-by.enum";


export const CATEGORIES_REPOSITORY = 'CATEGORY_REPOSITORY'

export interface ICategoryRepository {
    findAll(page: number, limit: number, order: OrderEnum, sortBy?: SortByCategory, name?: string): Promise<PaginatedResult<CategoryEntity>>;
    findOne(id: number): Promise<CategoryEntity | null>;
    create(input: CreateCategoryDto): Promise<CategoryEntity>;
    update(input: UpdateCategoryDto): Promise<CategoryEntity>;
    remove (category: CategoryEntity): Promise<CategoryEntity>;
}