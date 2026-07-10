import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { Order } from '../entities/order.entity';
import { EntityManager } from 'typeorm';

export const ORDERS_REPOSITORY = 'ORDERS_REPOSITORY';

export interface IOrdersRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    supplierId?: number,
  ): Promise<PaginatedResult<Order>>;
  findOneById(id: number): Promise<Order | null>;
  create(supplierId: number, total: number): Promise<Order>;
  update(order: Order): Promise<Order>;
  remove(order: Order): Promise<Order>;
}
