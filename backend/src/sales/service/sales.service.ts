import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateSaleDto, UpdateSaleDto, QueryParamsSales } from '../dto';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import type { SalesRepository } from '../repository/sales.repository.interface';
import { Sale } from '../entities/sale.entity';
import { DataSource } from 'typeorm';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Product } from 'src/products';
import { ProductsService } from 'src/products/service/products.service';
import { ClientsService } from 'src/clients/service/clients.service';
import { Client } from 'src/clients';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: SalesRepository,
    private readonly dataSource: DataSource,
    private readonly productsService: ProductsService,
    private readonly clientsService: ClientsService,
  ) {}

  async findAll(params: QueryParamsSales): Promise<PaginatedResult<Sale>> {
    const { page, limit, order, clientId } = params;
    return this.salesRepository.findAll(page, limit, order, clientId);
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOneById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.dataSource.transaction(async (manager) => {
      const saleRepo = manager.getRepository(Sale);
      let total = 0;
      const items: {
        product: Product;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }[] = [];

      for (const item of createSaleDto.details) {
        const product = await this.productsService.findOne(
          item.productId,
          manager,
        );
        const subtotal = product.salePrice * item.quantity;
        total += subtotal;
        await this.productsService.decreaseStock(
          product.id,
          item.quantity,
          manager,
        );
        items.push({
          product,
          unitPrice: product.salePrice,
          quantity: item.quantity,
          subtotal,
        });
      }
      let client: Client | undefined;
      if (createSaleDto.clientId) {
        client = await this.clientsService.findOne(
          createSaleDto.clientId,
          manager,
        );
      }
      const sale = saleRepo.create({
        total,
        paymentMethod: createSaleDto.paymentMethod,
        ...(client && { client }),
        details: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      });

      return saleRepo.save(sale);
    });
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);

    if (updateSaleDto.paymentMethod !== undefined)
      sale.paymentMethod = updateSaleDto.paymentMethod;

    return this.salesRepository.update(sale);
  }

  async remove(id: number): Promise<Sale> {
    const sale = await this.findOne(id);
    return this.salesRepository.remove(sale);
  }
}
