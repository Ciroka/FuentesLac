import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateSaleDto } from '../dto';
import { SalesRepository } from './sales.repository.interface';
import { Sale } from '../entities/sale.entity';

@Injectable()
export class SalesRepositoryImpl implements SalesRepository {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    clientId?: number,
  ): Promise<PaginatedResult<Sale>> {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.details', 'details')
      .leftJoinAndSelect('sale.client', 'client');

    if (clientId) {
      query.where('sale.clientId = :clientId', { clientId });
    }

    query.orderBy('sale.date', order);
    const offset = (page - 1) * limit;

    const [items, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOneById(id: number): Promise<Sale | null> {
    return this.saleRepository.findOne({
      where: { id },
      relations: { details: true, client: true },
    });
  }

  async create(input: CreateSaleDto): Promise<Sale> {
    return this.saleRepository.save(input as DeepPartial<Sale>);
  }

  async update(sale: Sale): Promise<Sale> {
    return this.saleRepository.save(sale);
  }

  async remove(sale: Sale): Promise<Sale> {
    return this.saleRepository.remove(sale);
  }
}
