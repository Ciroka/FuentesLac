import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateSaleDto, UpdateSaleDto, QueryParamsSales } from '../dto';
import { SALES_REPOSITORY } from '../repository/sales.repository.interface';
import type { SalesRepository } from '../repository/sales.repository.interface';
import { Sale } from '../entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: SalesRepository,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.salesRepository.create(createSaleDto);
  }

  async findAll(params: QueryParamsSales) {
    const { page, limit, order, clientId } = params;
    return this.salesRepository.findAll(page, limit, order, clientId);
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOneById(id);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const sale = await this.findOne(id);

    if (updateSaleDto.paymentMethod !== undefined)
      sale.paymentMethod = updateSaleDto.paymentMethod;

    return this.salesRepository.update(sale);
  }

  async remove(id: number) {
    const sale = await this.findOne(id);
    return this.salesRepository.remove(sale);
  }
}
