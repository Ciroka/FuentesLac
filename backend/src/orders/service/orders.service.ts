import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateOrderDto, UpdateOrderDto, QueryParamsOrders } from '../dto';
import { ORDERS_REPOSITORY } from '../repository/orders.repository.interface';
import type { IOrdersRepository } from '../repository/orders.repository.interface';
import { Order } from '../entities/order.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { DataSource } from 'typeorm';
import { OrdersDetailService } from 'src/orders-detail/service/orders-detail.service';
import { SuppliesService } from 'src/supplies/service/supplies.service';
import { Supply } from 'src/supplies';
import { Supplier } from 'src/suppliers';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    private readonly dataSource: DataSource,
    private readonly supplyService: SuppliesService,
    private readonly ordersDetailService: OrdersDetailService,
  ) {}

  async findAll(params: QueryParamsOrders): Promise<PaginatedResult<Order>> {
    const { page, limit, order, supplierId } = params;
    return this.ordersRepository.findAll(page, limit, order, supplierId);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.finById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      let total = 0;
      const items: {
        supply: Supply;
        orderedQuantity: number;
        subtotal: number;
      }[] = [];

      for (const item of createOrderDto.details) {
        const supply = await this.supplyService.findOne(item.supplyId, manager);
        const subtotal = supply.costPrice * item.quantity;
        total += subtotal;
        items.push({
          supply,
          orderedQuantity: item.quantity,
          subtotal,
        });
      }

      const order = await orderRepo.save(
        orderRepo.create({
          supplier: { id: createOrderDto.supplierId } as Supplier,
          total,
        }),
      );

      for (const item of items) {
        await this.ordersDetailService.create(
          { ...item, orderId: order.id },
          manager,
        );
      }
      return order;
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const details = await this.ordersDetailService.findByOrder(id);
      if (
        !updateOrderDto.details ||
        updateOrderDto.details.length !== details.length
      )
        throw new BadRequestException('Missing updates');
      for (let i = 0; i < details.length; i++) {
        const detail = details[i];
        const updateDtoDetail = updateOrderDto.details[i];
        if (detail.supply.id !== updateDtoDetail.supplyId)
          throw new BadRequestException('No se q poner');
        detail.arrivalQuantity = updateDtoDetail.quantity;
        await this.ordersDetailService.update(detail, manager);
      }
      order.ordersDetails = details;
      await orderRepo.save(order);
      return order;
    });
  }

  async remove(id: number): Promise<Order> {
    const order = await this.findOne(id);
    return this.ordersRepository.remove(order);
  }
}
