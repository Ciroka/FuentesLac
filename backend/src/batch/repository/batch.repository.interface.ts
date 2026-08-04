import { EntityManager } from 'typeorm';
import { Batch } from '../entities/batch.entity';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByBatch } from '../enums/sort-by.enum';

export const BATCH_REPOSITORY = 'BATCH_REPOSITORY';

export interface IBatchRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByBatch,
    productId?: number,
  ): Promise<PaginatedResult<Batch>>;
  findOneById(id: number, manager?: EntityManager): Promise<Batch | null>;
  create(input: Partial<Batch>, manager?: EntityManager): Promise<Batch>;
  update(batch: Partial<Batch>, manager?: EntityManager): Promise<Batch>;
  remove(batch: Batch): Promise<Batch>;
  decreaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Batch | null>;
  increaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Batch | null>;
  sumStockByProductId(productId: number): Promise<number>;
}
