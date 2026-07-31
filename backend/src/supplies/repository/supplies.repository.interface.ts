import { EntityManager } from 'typeorm';
import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateSupplyDto } from '../dto';
import { Supply } from '../entities/supply.entity';

export const SUPPLIES_REPOSITORY = 'SUPPLIES_REPOSITORY';

export interface ISuppliesRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
    categoryId?: number,
  ): Promise<PaginatedResult<Supply>>;
  findOneById(id: number, manager?: EntityManager): Promise<Supply | null>;
  create(input: CreateSupplyDto): Promise<Supply>;
  decreaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Supply | null>;
  increaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Supply | null>;
  update(supply: Supply, manager?: EntityManager): Promise<Supply>;
  remove(supply: Supply): Promise<Supply>;
}
