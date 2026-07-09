import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { CategoriesService } from '../service/categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryParamsCategories,
  CategoryResponse,
} from '../dto';
import { QueryParamsProducts } from '../../products/dto/request/params-products.dto';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { Product } from '../../products/entities/product.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsCategories,
  ): Promise<PaginatedResult<CategoryResponse>> {
    return this.categoriesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CategoryResponse> {
    return this.categoriesService.findOneById(+id);
  }

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get(':id/products')
  findAllProducts(
    @Param('id') id: string,
    @Query() params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    return this.categoriesService.findAllProducts(+id, params);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<CategoryResponse> {
    return this.categoriesService.remove(+id);
  }
}
