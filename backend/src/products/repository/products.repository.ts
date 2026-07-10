import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByProduct } from '../enums/sort-by.enum';
import { CreateProductDto } from '../dto';
import { ProductsRepository } from './products.repository.interface';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository implements ProductsRepository {
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

  async findOneById(
    id: number,
    manager?: EntityManager,
  ): Promise<Product | null> {
    const repo = manager
      ? manager.getRepository(Product)
      : this.productRepository;
    return repo.findOneBy({ id });
  }

  async findByName(
    name: string,
    manager?: EntityManager,
  ): Promise<Product | null> {
    const repo = manager
      ? manager.getRepository(Product)
      : this.productRepository;
    return repo.findOneBy({ name });
  }

  async create(input: CreateProductDto): Promise<Product> {
    return this.productRepository.save(input);
  }

  async update(product: Product, manager?: EntityManager): Promise<Product> {
    const repo = manager
      ? manager.getRepository(Product)
      : this.productRepository;
    return repo.save(product);
  }

  async decreaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Product | null> {
    const repo = manager
      ? manager.getRepository(Product)
      : this.productRepository;

    await repo
      .createQueryBuilder()
      .update(Product)
      .set({ currentStock: () => `current_stock - :amount` })
      .where('id = :id AND current_stock >= :amount', { id, amount })
      .execute();

    return repo.findOneBy({ id });
  }

  async increaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Product | null> {
    const repo = manager
      ? manager.getRepository(Product)
      : this.productRepository;

    await repo
      .createQueryBuilder()
      .update(Product)
      .set({ currentStock: () => `current_stock + :amount` })
      .where('id = :id', { id, amount })
      .execute();

    return repo.findOneBy({ id });
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
      query.where('product.name ILIKE :name', { name: `%${name}%` });
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
