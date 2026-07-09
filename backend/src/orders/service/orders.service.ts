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
import { OrdersDetail } from 'src/orders-detail';
import { DataSource } from 'typeorm';
import { ProductsService } from 'src/products/service/products.service';
import { OrdersDetailService } from 'src/orders-detail/service/orders-detail.service';
import { Product } from 'src/products';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    private readonly dataSource: DataSource,
    private readonly productsService: ProductsService,
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
      let total = 0;
      const items: {
        product: Product;
        orderedQuantity: number;
        subtotal: number;
      }[] = [];

      for (const item of createOrderDto.details) {
        const product = await this.productsService.findOne(
          item.supplyId,
          manager,
        );
        const subtotal = product.costPrice * item.quantity;
        total += subtotal;
        items.push({
          product,
          orderedQuantity: item.quantity,
          subtotal,
        });
      }

      const order = await this.ordersRepository.create(
        createOrderDto.supplierId,
        total,
        manager,
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
      await this.ordersRepository.update(order, manager);
      return order;
    });
  }

  async remove(id: number): Promise<Order> {
    const order = await this.findOne(id);
    return this.ordersRepository.remove(order);
  }
}
