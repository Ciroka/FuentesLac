import { PaginatedResult } from 'src/shared/Pagination/pagination.type';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { OrderEnum } from 'src/shared/enums/order.enum';
import { SortByCategory } from '../enums/sort-by.enum';

export const CATEGORIES_REPOSITORY = 'CATEGORY_REPOSITORY';

export interface ICategoryRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByCategory,
    name?: string,
  ): Promise<PaginatedResult<Category>>;
  findOne(id: number): Promise<Category | null>;
  create(input: CreateCategoryDto): Promise<Category>;
  update(input: UpdateCategoryDto): Promise<Category>;
  remove(category: Category): Promise<Category>;
}
