import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { OrderStatus } from '../../shared/enums/orderStatus.enum';
import { IOrdersRepository } from './orders.repository.interface';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    supplierId?: number,
    status?: OrderStatus,
  ): Promise<PaginatedResult<Order>> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.ordersDetails', 'details')
      .leftJoinAndSelect('details.supply', 'supply')
      .leftJoinAndSelect('order.supplier', 'supplier');

    if (supplierId) {
      query.andWhere('order.supplierId = :supplierId', { supplierId });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    query.orderBy('order.date', order);
    const offset = (page - 1) * limit;

    const [orders, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const paginatedResult: PaginatedResult<Order> = {
      items: orders,
      total,
      page,
      limit,
    };

    return paginatedResult;
  }

  async findOneById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: { ordersDetails: true, supplier: true },
    });
  }

  async save(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }
}
