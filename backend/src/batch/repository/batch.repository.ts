import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IBatchRepository } from './batch.repository.interface';
import { Batch } from '../entities/batch.entity';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByBatch } from '../enums/sort-by.enum';

@Injectable()
export class BatchRepository implements IBatchRepository {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByBatch,
    productId?: number,
  ): Promise<PaginatedResult<Batch>> {
    const query = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.product', 'product');

    if (productId) {
      query.andWhere('batch.productId = :productId', { productId });
    }

    if (sortBy) {
      query.orderBy(`batch.${sortBy}`, order, 'NULLS LAST');
    }
    query.addOrderBy('batch.id', 'DESC');

    const offset = (page - 1) * limit;
    const [items, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOneById(
    id: number,
    manager?: EntityManager,
  ): Promise<Batch | null> {
    const repo = manager ? manager.getRepository(Batch) : this.batchRepository;
    return repo.findOne({ where: { id }, relations: { product: true } });
  }

  async create(input: Partial<Batch>, manager?: EntityManager): Promise<Batch> {
    const repo = manager ? manager.getRepository(Batch) : this.batchRepository;
    return repo.save(input);
  }

  async update(batch: Partial<Batch>, manager?: EntityManager): Promise<Batch> {
    const repo = manager ? manager.getRepository(Batch) : this.batchRepository;
    return repo.save(batch);
  }

  async remove(batch: Batch): Promise<Batch> {
    return this.batchRepository.remove(batch);
  }

  async decreaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Batch | null> {
    const repo = manager ? manager.getRepository(Batch) : this.batchRepository;

    const result = await repo
      .createQueryBuilder()
      .update(Batch)
      .set({ currentStock: () => `current_stock - :amount` })
      .where('id = :id AND current_stock >= :amount', { id, amount })
      .execute();

    if (!result.affected) return null;
    return repo.findOneBy({ id });
  }

  async increaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Batch | null> {
    const repo = manager ? manager.getRepository(Batch) : this.batchRepository;

    const result = await repo
      .createQueryBuilder()
      .update(Batch)
      .set({ currentStock: () => `current_stock + :amount` })
      .where('id = :id', { id, amount })
      .execute();

    if (!result.affected) return null;
    return repo.findOneBy({ id });
  }
  async sumStockByProductId(productId: number): Promise<number> {
    const raw = await this.batchRepository
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.currentStock), 0)', 'total')
      .where('b.productId = :productId', { productId })
      .getRawOne<{ total: string }>();
    return Number(raw?.total ?? 0);
  }
}
