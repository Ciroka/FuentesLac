import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ORDERS_DETAIL_REPOSITORY } from '../repository/orders-detail.repository.interface';
import type { IOrdersDetailRepository } from '../repository/orders-detail.repository.interface';
import { OrdersDetail } from '../entities/orders-detail.entity';
import { EntityManager } from 'typeorm';
import { CreateOrderDetailData } from '../dto/create-order-detail-data.dto';

@Injectable()
export class OrdersDetailService {
  constructor(
    @Inject(ORDERS_DETAIL_REPOSITORY)
    private readonly detailRepository: IOrdersDetailRepository,
  ) {}

  async findAll(): Promise<OrdersDetail[]> {
    return this.detailRepository.findAll();
  }

  async findOne(id: number): Promise<OrdersDetail> {
    const detail = await this.detailRepository.finById(id);
    if (!detail) throw new NotFoundException('Orders detail not found');
    return detail;
  }

  async findByOrder(orderId: number): Promise<OrdersDetail[]> {
    return this.detailRepository.findByOrder(orderId);
  }

  async create(
    createOrdersDetailDto: CreateOrderDetailData,
    manager?: EntityManager,
  ): Promise<OrdersDetail> {
    return this.detailRepository.create(createOrdersDetailDto, manager);
  }

  async update(
    orderDetail: OrdersDetail,
    manager?: EntityManager,
  ): Promise<OrdersDetail> {
    const detail = await this.findOne(orderDetail.id);
    //detail.subtotal = detail.orderedQuantity * Number(detail.supply.costPrice);
    return this.detailRepository.update(orderDetail, manager);
  }

  async remove(id: number): Promise<OrdersDetail> {
    const detail = await this.findOne(id);
    return this.detailRepository.remove(detail);
  }
}
