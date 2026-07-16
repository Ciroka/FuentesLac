import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateSaleDto, UpdateSaleDto, QueryParamsSales } from '../dto';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import type { SalesRepository } from '../repository/sales.repository.interface';
import { Sale } from '../entities/sale.entity';
import { DataSource } from 'typeorm';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Batch } from 'src/batch/entities/batch.entity';
import { BatchService } from 'src/batch/service/batch.service';
import { ClientsService } from 'src/clients/service/clients.service';
import { Client } from 'src/clients';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: SalesRepository,
    private readonly dataSource: DataSource,
    private readonly batchService: BatchService,
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
        batch: Batch;
        unitPrice: number;
        quantity: number;
        subtotal: number;
        weight?: number;
      }[] = [];

      for (const item of createSaleDto.details) {
        const batch = await this.batchService.findOne(item.batchId, manager);
        const unitPrice = batch.product.salePrice;
        const subtotal = unitPrice * item.quantity;
        total += subtotal;

        await this.batchService.decreaseStock(batch.id, item.quantity, manager);

        if (item.weight) {
          await this.batchService.addSoldWeight(batch.id, item.weight, manager);
        }

        items.push({
          batch,
          unitPrice,
          quantity: item.quantity,
          subtotal,
          weight: item.weight,
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
          batch: item.batch,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          weight: item.weight,
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