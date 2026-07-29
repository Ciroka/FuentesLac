import { OrderEnum } from '../../shared/enums/order.enum';
import { OrderStatus } from '../../shared/enums/orderStatus.enum';
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
    status?: OrderStatus,
  ): Promise<PaginatedResult<Order>>;
  findOneById(id: number): Promise<Order | null>;
  save(order: Order): Promise<Order>;
}
