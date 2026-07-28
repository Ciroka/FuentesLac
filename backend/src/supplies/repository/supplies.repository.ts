import { EntityManager, Repository } from 'typeorm';
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
    const query = this.supplyRepository
      .createQueryBuilder('supply')
      .leftJoinAndSelect('supply.supplier', 'supplier')
      .leftJoinAndSelect('supply.category', 'category');

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

  async findOneById(
    id: number,
    manager?: EntityManager,
  ): Promise<Supply | null> {
    const repo = manager
      ? manager.getRepository(Supply)
      : this.supplyRepository;
    return repo.findOneBy({ id });
  }

  async create(input: CreateSupplyDto): Promise<Supply> {
    return this.supplyRepository.save(input);
  }

  async decreaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Supply | null> {
    const repo = manager
      ? manager.getRepository(Supply)
      : this.supplyRepository;

    await repo
      .createQueryBuilder()
      .update(Supply)
      .set({ currentStock: () => `current_stock - :amount` })
      .where('id = :id AND current_stock >= :amount', { id, amount })
      .execute();

    return repo.findOneBy({ id });
  }

  async increaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Supply | null> {
    const repo = manager
      ? manager.getRepository(Supply)
      : this.supplyRepository;

    await repo
      .createQueryBuilder()
      .update(Supply)
      .set({ currentStock: () => `current_stock + :amount` })
      .where('id = :id', { id, amount })
      .execute();

    return repo.findOneBy({ id });
  }

  async update(supply: Supply, manager?: EntityManager): Promise<Supply> {
    const repo = manager
      ? manager.getRepository(Supply)
      : this.supplyRepository;
    return repo.save(supply);
  }

  async remove(supply: Supply): Promise<Supply> {
    return this.supplyRepository.remove(supply);
  }
}
