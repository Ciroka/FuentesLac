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

      const order = orderRepo.create({
        supplier: { id: createOrderDto.supplierId } as Supplier,
        orderedTotal: total,
        ordersDetails: items.map((item) => ({
          supply: item.supply,
          orderedQuantity: item.orderedQuantity,
          orderedSubtotal: item.subtotal,
        })),
      });

      return orderRepo.save(order);
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id },
        relations: {
          ordersDetails: {
            supply: true,
          },
        },
      });

      if (!order || !updateOrderDto.details) {
        throw new BadRequestException('Missing updates');
      }
      for (const updateDtoDetail of updateOrderDto.details) {
        const detail = order.ordersDetails.find((d) => d.supply.id === updateDtoDetail.supplyId);
        if (!detail) throw new BadRequestException('No se q poner');
        detail.arrivalQuantity += updateDtoDetail.quantity;
        await this.supplyService.increaseStock(detail.supply, updateDtoDetail.quantity, manager);
      }
      order.arrival_total = order.ordersDetails.reduce((total, d) => total + Number(d.supply.costPrice) * Number(d.arrivalQuantity), 0);

      return orderRepo.save(order);
    });
  }

  async remove(id: number): Promise<Order>{
    const order = await this.findOne(id);
    return this.ordersRepository.remove(order);
  }
}
