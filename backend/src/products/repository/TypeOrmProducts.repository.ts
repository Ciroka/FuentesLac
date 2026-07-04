import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "../entities/product.entity";
import { Repository } from "typeorm";
import { ProductsRepository } from "./product.repository";
import { CreateProductDto } from "../dto/create-product.dto";
import { OrderEnum } from "src/shared/enums/order.enum";
import { SortByProduct } from "../enums/sort-by.enum";
import { PaginatedResult } from "src/shared/Pagination/pagination.type";

@Injectable()
export class TypeOrmProductRespository implements ProductsRepository{
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ){}

    async findAll(page: number, limit: number, order: OrderEnum, sortBy?: SortByProduct, name?: string, categoryId?: number): Promise<PaginatedResult<ProductEntity>> {
        const query = this.queryBuilder(sortBy, name, categoryId, order);
        const offset = (page - 1) * limit;

        const [products, total] = await query.take(limit).skip(offset).getManyAndCount();

        const PaginatedResult: PaginatedResult<ProductEntity> = {
            items: products,
            total,
            page, 
            limit
        };

        return PaginatedResult;
    }

    
    async finById(id: number): Promise<ProductEntity | null> {
        return this.productRepository.findOneBy({id});
    }
    
    async create(input: CreateProductDto): Promise<ProductEntity> {
        return this.productRepository.save(input);
    }
    
    async update(product: ProductEntity): Promise<ProductEntity> {
        return this.productRepository.save(product);
    }
    
    async remove(product: ProductEntity): Promise<ProductEntity> {
        return this.productRepository.remove(product);
    }

    private queryBuilder(sortBy?: SortByProduct, name?: string, categoryId?: number, order: OrderEnum = OrderEnum.ASC){
        const query = this.productRepository.createQueryBuilder('product').leftJoinAndSelect('product.category', 'category');
    
        if (name){
            query.where('product.name ILIKE name', {name : `%${name}%`});
        }
    
        if(sortBy){
            query.orderBy(`product.${sortBy}`, order);
        }
    
        if(categoryId) {
            query.andWhere('product.categoryId = :categoryId', {categoryId})
        }
    
        return query;
    }
}