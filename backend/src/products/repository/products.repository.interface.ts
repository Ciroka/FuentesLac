import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByProduct } from '../enums/sort-by.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateProductDto } from '../dto';
import { Product } from '../entities/product.entity';
import { EntityManager } from 'typeorm';

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
  findOneById(id: number, manager?: EntityManager): Promise<Product | null>;
  findByName(name: string, manager?: EntityManager): Promise<Product | null>;
  create(input: CreateProductDto): Promise<Product>;
  update(product: Product, manager?: EntityManager): Promise<Product>;
  remove(product: Product): Promise<Product>;
}
