import { OrdersDetail } from '../entities/orders-detail.entity';
import { EntityManager } from 'typeorm';
import { CreateOrderDetailData } from '../dto/create-order-detail-data.dto';

export const ORDERS_DETAIL_REPOSITORY = 'ORDERS_DETAIL_REPOSITORY';

export interface IOrdersDetailRepository {
  findAll(): Promise<OrdersDetail[]>;
  findByOrder(orderId: number): Promise<OrdersDetail[]>;
  findOneById(id: number): Promise<OrdersDetail | null>;
  create(
    input: CreateOrderDetailData,
    manager?: EntityManager,
  ): Promise<OrdersDetail>;
  update(detail: OrdersDetail, manager?: EntityManager): Promise<OrdersDetail>;
  remove(detail: OrdersDetail): Promise<OrdersDetail>;
}
