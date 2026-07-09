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
  finById(id: number, manager?: EntityManager): Promise<Supply | null>;
  create(input: CreateSupplyDto): Promise<Supply>;
  update(supply: Supply): Promise<Supply>;
  remove(supply: Supply): Promise<Supply>;
}
