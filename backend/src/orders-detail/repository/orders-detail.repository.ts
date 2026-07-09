import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IOrdersDetailRepository } from './orders-detail.repository.interface';
import { OrdersDetail } from '../entities/orders-detail.entity';
import { CreateOrderDetailData } from '../dto/create-order-detail-data.dto';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class OrdersDetailRepository implements IOrdersDetailRepository {
  constructor(
    @InjectRepository(OrdersDetail)
    private readonly detailRepository: Repository<OrdersDetail>,
  ) {}

  async findAll(): Promise<OrdersDetail[]> {
    return this.detailRepository.find({
      relations: { order: true, supply: true },
    });
  }

  async findByOrder(orderId: number): Promise<OrdersDetail[]> {
    return this.detailRepository.find({
      where: { order: { id: orderId } as any },
      relations: { supply: true },
    });
  }

  async finById(id: number): Promise<OrdersDetail | null> {
    return this.detailRepository.findOne({
      where: { id },
      relations: { order: true, supply: true },
    });
  }

  async create(
    input: CreateOrderDetailData,
    manager?: EntityManager,
  ): Promise<OrdersDetail> {
    const repo = manager
      ? manager.getRepository(OrdersDetail)
      : this.detailRepository;
    return repo.save({
      order: { id: input.orderId } as Order,
      supply: input.supply,
      orderedQuantity: input.orderedQuantity,
      subtotal: input.subtotal,
    });
  }

  async update(
    detail: OrdersDetail,
    manager?: EntityManager,
  ): Promise<OrdersDetail> {
    const repo = manager
      ? manager.getRepository(OrdersDetail)
      : this.detailRepository;
    return repo.save(detail);
  }

  async remove(detail: OrdersDetail): Promise<OrdersDetail> {
    return this.detailRepository.remove(detail);
  }
}
