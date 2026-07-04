import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CATEGORIES_REPOSITORY } from '../repositories/category.repository';
import type { ICategoryRepository } from '../repositories/category.repository';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/service/products.service';
import { QueryParamsCategories } from '../dto/params-categories.dto';
import { QueryParamsProducts } from 'src/products/dto/params-products.dto';
import { PaginatedResult } from 'src/shared/Pagination/pagination.type';
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
    const { page, limit, order, sortBy, name } = params;
    return this.categoriesRepository.findAll(page, limit, order, sortBy, name);
  }

  async findOneById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne(id);
    if (!category) throw new NotFoundException('Category no found');
    return category;
  }

  async findAllProducts(
    id: number,
    params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    await this.findOneById(id);
    return this.productsService.findAllByCategory(id, params);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    return this.categoriesRepository.create(createCategoryDto);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOneById(id);

    if (updateCategoryDto.name !== undefined)
      category.name = updateCategoryDto.name;
    if (updateCategoryDto.description !== undefined)
      category.description = updateCategoryDto.description;

    return this.categoriesRepository.update(category);
  }

  async remove(id: number) {
    const category = await this.findOneById(id);
    return this.categoriesRepository.remove(category);
  }
}
