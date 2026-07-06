import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { SortByCategory } from '../enums/sort-by.enum';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { ICategoryRepository } from './category.repository';
import { Category } from '../entities/category.entity';

@Injectable()
export class TypeOrmCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByCategory,
    name?: string,
  ): Promise<PaginatedResult<Category>> {
    const query = this.queryBuilder(sortBy, name, order);
    const offset = (page - 1) * limit;

    const [products, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const PaginatedResult: PaginatedResult<Category> = {
      items: products,
      total,
      page,
      limit,
    };

    return PaginatedResult;
  }
  async findOne(id: number): Promise<Category | null> {
    return this.categoriesRepository.findOneBy({ id });
  }
  async create(input: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.save(input);
  }
  async update(input: UpdateCategoryDto): Promise<Category> {
    return this.categoriesRepository.save(input);
  }
  async remove(category: Category): Promise<Category> {
    return this.categoriesRepository.remove(category);
  }

  private queryBuilder(
    sortBy?: SortByCategory,
    name?: string,
    order: OrderEnum = OrderEnum.ASC,
  ) {
    const query = this.categoriesRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (name) {
      query.where('product.name ILIKE name', { name: `%${name}%` });
    }

    if (sortBy) {
      query.orderBy(`product.${sortBy}`, order);
    }
    return query;
  }
}
