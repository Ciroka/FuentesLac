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

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryParamsProducts,
  ProductResponse,
} from '../dto';
import { ProductsService } from '../service/products.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() params: QueryParamsProducts,
  ): Promise<PaginatedResult<ProductResponse>> {
    return this.productsService.findAll(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponse> {
    return await this.productsService.findOne(+id);
  }

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.create(createProductDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.update(+id, updateProductDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ProductResponse> {
    return await this.productsService.remove(+id);
  }
}
