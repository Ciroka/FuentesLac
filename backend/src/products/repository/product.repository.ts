import { PaginatedResult } from "src/shared/Pagination/pagination.type";
import { CreateProductDto } from "../dto/create-product.dto";
import { ProductEntity } from "../entities/product.entity"
import { OrderEnum } from "src/shared/enums/order.enum";
import { SortByProduct } from "../enums/sort-by.enum";


export const PRODUCTS_REPOSITORY = 'PRODUCTS_REPOSITORY'

export interface ProductsRepository {
    findAll(page: number, limit: number, order: OrderEnum, sortBy?: SortByProduct, name?: string, categoryId?: number): Promise<PaginatedResult<ProductEntity>>;
    finById(id: number): Promise<ProductEntity | null>;
    create(input: CreateProductDto): Promise<ProductEntity>;
    update(product: ProductEntity): Promise<ProductEntity>;
    remove(product: ProductEntity): Promise<ProductEntity>;
}