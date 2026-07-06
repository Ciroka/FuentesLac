import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CreateProductDto,
  UpdateProductDto,
  QueryParamsProducts,
} from '../dto';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { PRODUCTS_REPOSITORY } from '../repository/product.repository';
import type { ProductsRepository } from '../repository/product.repository';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepository,
  ) {}

  async findAll(
    params: QueryParamsProducts,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, order, sortBy, name } = params;
    return this.productsRepository.findAll(page, limit, order, sortBy, name);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.finById(id);
    if (!product) throw new NotFoundException('Product not Found');
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (!createProductDto.salePrice) {
      createProductDto.salePrice =
        createProductDto.costPrice * (1 + createProductDto.marginPercent);
    }
    return this.productsRepository.create(createProductDto);
  }

  async findAllByCategory(categoryId: number, params: QueryParamsProducts) {
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

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.name !== undefined)
      product.name = updateProductDto.name;
    if (updateProductDto.salePrice !== undefined)
      product.salePrice = updateProductDto.salePrice;
    if (updateProductDto.costPrice !== undefined)
      product.costPrice = updateProductDto.costPrice;
    if (updateProductDto.marginPercent !== undefined)
      product.marginPercent = updateProductDto.marginPercent;
    if (updateProductDto.currentStock !== undefined)
      product.currentStock = updateProductDto.currentStock;
    if (updateProductDto.minStock !== undefined)
      product.minStock = updateProductDto.minStock;
    if (updateProductDto.categoryId !== undefined)
      product.categoryId = updateProductDto.categoryId;

    return this.productsRepository.update(product);
  }

  async decreaseStock(id: number, stock: number) {
    const product = await this.findOne(id);
    if (stock > product.currentStock)
      throw new BadRequestException('Insufficient current stock');
    product.currentStock -= stock;
    return this.productsRepository.update(product);
  }

  async increaseStock(id: number, stock: number) {
    const product = await this.findOne(id);
    product.currentStock += stock;
    return this.productsRepository.update(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productsRepository.remove(product);
  }
}
