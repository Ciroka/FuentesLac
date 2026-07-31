import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
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
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

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
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponse> {
    return this.categoriesService.findOneById(id);
  }

  @Get(':id/products')
  findAllProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query() params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    return this.categoriesService.findAllProducts(id, params);
  }

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponse> {
    return this.categoriesService.remove(id);
  }
}
