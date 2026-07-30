import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { SortByCategory } from '../enums/sort-by.enum';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { ICategoryRepository } from './categories.repository.interface';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository implements ICategoryRepository {
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
    usedBy?: 'products' | 'supplies',
  ): Promise<PaginatedResult<Category>> {
    const query = this.queryBuilder(sortBy, name, order, usedBy);
    const offset = (page - 1) * limit;

    const [categories, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const PaginatedResult: PaginatedResult<Category> = {
      items: categories,
      total,
      page,
      limit,
    };

    return PaginatedResult;
  }
  async findOneById(id: number): Promise<Category | null> {
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
    usedBy?: 'products' | 'supplies',
  ) {
    const query = this.categoriesRepository.createQueryBuilder('category');

    if (usedBy === 'products') {
      query.innerJoin('category.products', 'product').distinct(true);
    } else if (usedBy === 'supplies') {
      query.innerJoin('category.supplies', 'supply').distinct(true);
    }

    if (name) {
      query.andWhere('category.name ILIKE :name', { name: `%${name}%` });
    }

    if (sortBy) {
      query.orderBy(`category.${sortBy}`, order);
    }
    return query;
  }
}
