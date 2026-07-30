import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryParamsCategories,
} from '../dto';
import { CATEGORIES_REPOSITORY } from '../repository/categories.repository.interface';
import type { ICategoryRepository } from '../repository/categories.repository.interface';
import { Product } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/service/products.service';
import { QueryParamsProducts } from '../../products/dto/request/params-products.dto';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: ICategoryRepository,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(
    params: QueryParamsCategories,
  ): Promise<PaginatedResult<Category>> {
    const { page, limit, order, sortBy, name, usedBy } = params;
    return this.categoriesRepository.findAll(
      page,
      limit,
      order,
      sortBy,
      name,
      usedBy,
    );
  }

  async findOneById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findAllProducts(
    id: number,
    params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    await this.findOneById(id);
    return this.productsService.findAllByCategory(id, params);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(createCategoryDto);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneById(id);

    if (updateCategoryDto.name !== undefined)
      category.name = updateCategoryDto.name;
    if (updateCategoryDto.description !== undefined)
      category.description = updateCategoryDto.description;

    return this.categoriesRepository.update(category);
  }

  async remove(id: number): Promise<Category> {
    const category = await this.findOneById(id);
    return this.categoriesRepository.remove(category);
  }
}
