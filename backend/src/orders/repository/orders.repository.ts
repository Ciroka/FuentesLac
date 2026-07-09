import { Repository, DeepPartial, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { IOrdersRepository } from './orders.repository.interface';
import { Order } from '../entities/order.entity';
import { Supplier } from 'src/suppliers';

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
  ): Promise<PaginatedResult<Order>> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.ordersDetails', 'details')
      .leftJoinAndSelect('order.supplier', 'supplier');

    if (supplierId) {
      query.where('order.supplierId = :supplierId', { supplierId });
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

  async finById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: { ordersDetails: true, supplier: true },
    });
  }

  async create(supplierId: number, total: number): Promise<Order> {
    const order = this.orderRepository.create({
      orderedTotal: total,
      supplier: { id: supplierId } as Supplier,
    });
    return this.orderRepository.save(order);
  }

  async update(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }

  async remove(order: Order): Promise<Order> {
    return this.orderRepository.remove(order);
  }
}
