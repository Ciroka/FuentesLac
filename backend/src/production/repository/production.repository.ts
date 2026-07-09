import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { ProductionRepository } from './production.repository.interface';
import { Production } from '../entities/production.entity';

@Injectable()
export class ProductionRepositoryImpl implements ProductionRepository {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
  ): Promise<PaginatedResult<Production>> {
    const offset = (page - 1) * limit;

    const [items, total] = await this.productionRepository
      .createQueryBuilder('production')
      .leftJoinAndSelect('production.details', 'details')
      .orderBy('production.productionDate', order)
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async finById(id: number): Promise<Production | null> {
    return this.productionRepository.findOne({
      where: { id },
      relations: { details: true },
    });
  }

  async create(input: Partial<Production>): Promise<Production> {
    return this.productionRepository.save(input);
  }

  async update(production: Production): Promise<Production> {
    return this.productionRepository.save(production);
  }

  async remove(production: Production): Promise<Production> {
    return this.productionRepository.remove(production);
  }
}
