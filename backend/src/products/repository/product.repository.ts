import { PaginatedResult } from 'src/shared/Pagination/pagination.type';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { OrderEnum } from 'src/shared/enums/order.enum';
import { SortByProduct } from '../enums/sort-by.enum';

export const PRODUCTS_REPOSITORY = 'PRODUCTS_REPOSITORY';

export interface ProductsRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByProduct,
    name?: string,
    categoryId?: number,
  ): Promise<PaginatedResult<Product>>;
  finById(id: number): Promise<Product | null>;
  create(input: CreateProductDto): Promise<Product>;
  update(product: Product): Promise<Product>;
  remove(product: Product): Promise<Product>;
}
