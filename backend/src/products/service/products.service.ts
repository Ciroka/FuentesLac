import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateProductDto,
  UpdateProductDto,
  QueryParamsProducts,
} from '../dto';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { PRODUCTS_REPOSITORY } from '../repository/products.repository.interface';
import type { ProductsRepository } from '../repository/products.repository.interface';
import { Product } from '../entities/product.entity';
import { EntityManager } from 'typeorm';
import { BatchService } from 'src/batch/service/batch.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepository,
    private readonly batchService: BatchService,
  ) {}

  async findAll(
    params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, order, sortBy, name } = params;
    return this.productsRepository.findAll(page, limit, order, sortBy, name);
  }

  async findOne(id: number, manager?: EntityManager): Promise<Product> {
    const product = await this.productsRepository.findOneById(id, manager);
    if (!product) throw new NotFoundException('Product not Found');
    return product;
  }

  async findOneByName(name: string, manager?: EntityManager): Promise<Product> {
    const product = await this.productsRepository.findByName(name, manager);
    if (!product) throw new NotFoundException('Product not Found');
    return product;
  }

  async getTotalStock(id: number): Promise<number>{
    return this.batchService.getTotalStockByProduct(id);
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (!createProductDto.salePrice) {
      createProductDto.salePrice =
        createProductDto.costPrice * (1 + createProductDto.marginPercent);
    }
    return this.productsRepository.create(createProductDto);
  }

  async findAllByCategory(
    categoryId: number,
    params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, order, sortBy, name } = params;
    return this.productsRepository.findAll(
      page,
      limit,
      order,
      sortBy,
      name,
      categoryId,
    );
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.name !== undefined)
      product.name = updateProductDto.name;
    if (updateProductDto.salePrice !== undefined)
      product.salePrice = updateProductDto.salePrice;
    if (updateProductDto.costPrice !== undefined)
      product.costPrice = updateProductDto.costPrice;
    if (updateProductDto.marginPercent !== undefined)
      product.marginPercent = updateProductDto.marginPercent;
    if (updateProductDto.minStock !== undefined)
      product.minStock = updateProductDto.minStock;
    if (updateProductDto.categoryId !== undefined)
      product.categoryId = updateProductDto.categoryId;

    return this.productsRepository.update(product);
  }

  async remove(id: number): Promise<Product> {
    const product = await this.findOne(id);
    return await this.productsRepository.remove(product);
  }
}