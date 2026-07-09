import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByCategory } from '../enums/sort-by.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { Category } from '../entities/category.entity';

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
