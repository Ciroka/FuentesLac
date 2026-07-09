import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateSupplyDto } from '../dto';
import { ISuppliesRepository } from './supplies.repository.interface';
import { Supply } from '../entities/supply.entity';

@Injectable()
export class SuppliesRepository implements ISuppliesRepository {
  constructor(
    @InjectRepository(Supply)
    private readonly supplyRepository: Repository<Supply>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
    categoryId?: number,
  ): Promise<PaginatedResult<Supply>> {
    const query = this.supplyRepository.createQueryBuilder('supply');

    if (name) {
      query.where('supply.name ILIKE :name', { name: `%${name}%` });
    }

    if (categoryId) {
      query.andWhere('supply.categoryId = :categoryId', { categoryId });
    }

    query.orderBy('supply.name', order);
    const offset = (page - 1) * limit;

    const [supplies, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items: supplies, total, page, limit };
  }

  async finById(id: number): Promise<Supply | null> {
    return this.supplyRepository.findOneBy({ id });
  }

  async create(input: CreateSupplyDto): Promise<Supply> {
    return this.supplyRepository.save(input);
  }

  async update(supply: Supply): Promise<Supply> {
    return this.supplyRepository.save(supply);
  }

  async remove(supply: Supply): Promise<Supply> {
    return this.supplyRepository.remove(supply);
  }
}
