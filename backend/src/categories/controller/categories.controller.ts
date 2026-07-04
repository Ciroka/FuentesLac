import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from '../service/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryParamsProducts } from 'src/products/dto/params-products.dto';
import { ProductEntity } from 'src/products/entities/product.entity';
import { PaginatedResult } from 'src/shared/Pagination/pagination.type';
import { CategoryResponse } from '../dto/category-response.dto';
import { QueryParamsCategories } from '../dto/params-categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() params: QueryParamsCategories): Promise<PaginatedResult<CategoryResponse>> {
    return this.categoriesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CategoryResponse> {
    return this.categoriesService.findOneById(+id);
  }
  
  @Get(':id/products')
  findAllProducts(@Param('id') id: string, @Query() params: QueryParamsProducts): Promise<PaginatedResult<ProductEntity>>{
    return this.categoriesService.findAllProducts(+id, params);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponse> {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<CategoryResponse> {
    return this.categoriesService.remove(+id);
  }
}
