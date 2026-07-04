import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductsRepository } from './product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { OrderEnum } from 'src/shared/enums/order.enum';
import { SortByProduct } from '../enums/sort-by.enum';
import { PaginatedResult } from 'src/shared/Pagination/pagination.type';

@Injectable()
export class TypeOrmProductRespository implements ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByProduct,
    name?: string,
    categoryId?: number,
  ): Promise<PaginatedResult<Product>> {
    const query = this.queryBuilder(sortBy, name, categoryId, order);
    const offset = (page - 1) * limit;

    const [products, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const PaginatedResult: PaginatedResult<Product> = {
      items: products,
      total,
      page,
      limit,
    };

    return PaginatedResult;
  }

  async finById(id: number): Promise<Product | null> {
    return this.productRepository.findOneBy({ id });
  }

  async create(input: CreateProductDto): Promise<Product> {
    return this.productRepository.save(input);
  }

  async update(product: Product): Promise<Product> {
    return this.productRepository.save(product);
  }

  async remove(product: Product): Promise<Product> {
    return this.productRepository.remove(product);
  }

  private queryBuilder(
    sortBy?: SortByProduct,
    name?: string,
    categoryId?: number,
    order: OrderEnum = OrderEnum.ASC,
  ) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (name) {
      query.where('product.name ILIKE name', { name: `%${name}%` });
    }

    if (sortBy) {
      query.orderBy(`product.${sortBy}`, order);
    }

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    return query;
  }
}
