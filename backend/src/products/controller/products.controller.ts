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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponse> {
    return this.productsService.findOne(id);
  }

  @Get(':id/stock-status')
  async getStockStatus(@Param('id', ParseIntPipe) id: number) {
    const totalStock = await this.productsService.getTotalStock(id);
    const product = await this.productsService.findOne(id);
    return {
      productId: id,
      productName: product.name,
      minStock: product.minStock,
      totalStock,
      isLowStock: totalStock <= product.minStock,
    };
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.create(createProductDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.update(id, updateProductDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponse> {
    return await this.productsService.remove(id);
  }
}
