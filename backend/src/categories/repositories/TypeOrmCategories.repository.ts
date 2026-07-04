import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from './category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryEntity } from '../entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from 'src/shared/Pagination/pagination.type';
import { SortByCategory } from '../enums/sort-by.enum';
import { OrderEnum } from 'src/shared/enums/order.enum';

@Injectable()
export class TypeOrmCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByCategory,
    name?: string,
  ): Promise<PaginatedResult<CategoryEntity>> {
    const query = this.queryBuilder(sortBy, name, order);
    const offset = (page - 1) * limit;

    const [products, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const PaginatedResult: PaginatedResult<CategoryEntity> = {
      items: products,
      total,
      page,
      limit,
    };

    return PaginatedResult;
  }
  async findOne(id: number): Promise<CategoryEntity | null> {
    return this.categoriesRepository.findOneBy({ id });
  }
  async create(input: CreateCategoryDto): Promise<CategoryEntity> {
    return this.categoriesRepository.save(input);
  }
  async update(input: UpdateCategoryDto): Promise<CategoryEntity> {
    return this.categoriesRepository.save(input);
  }
  async remove(category: CategoryEntity): Promise<CategoryEntity> {
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
