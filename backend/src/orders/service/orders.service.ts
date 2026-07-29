import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CreateOrderDto,
  RegisterArrivalDto,
  ArrivalDetailDto,
  QueryParamsOrders,
} from '../dto';
import { ORDERS_REPOSITORY } from '../repository/orders.repository.interface';
import type { IOrdersRepository } from '../repository/orders.repository.interface';
import { Order } from '../entities/order.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { DataSource } from 'typeorm';
import { SuppliesService } from 'src/supplies/service/supplies.service';
import { Supply } from 'src/supplies';
import { Supplier } from 'src/suppliers';
import { OrderStatus } from 'src/shared/enums/orderStatus.enum';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    private readonly dataSource: DataSource,
    private readonly suppliesService: SuppliesService,
  ) {}

  async findAll(params: QueryParamsOrders): Promise<PaginatedResult<Order>> {
    const { page, limit, order, supplierId, status } = params;
    return this.ordersRepository.findAll(
      page,
      limit,
      order,
      supplierId,
      status,
    );
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOneById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      let total = 0;

      const items: {
        supply: Supply;
        unitPrice: number;
        orderedQuantity: number;
        subtotal: number;
      }[] = [];

      for (const item of createOrderDto.details) {
        const supply = await this.suppliesService.findOne(
          item.supplyId,
          manager,
        );
        const subtotal = supply.costPrice * item.quantity;
        total += subtotal;
        items.push({
          supply,
          unitPrice: supply.costPrice,
          orderedQuantity: item.quantity,
          subtotal,
        });
      }

      const order = orderRepo.create({
        supplier: { id: createOrderDto.supplierId } as Supplier,
        orderedTotal: total,
        ordersDetails: items.map((item) => ({
          supply: item.supply,
          unitPrice: item.unitPrice,
          orderedQuantity: item.orderedQuantity,
          orderedSubtotal: item.subtotal,
        })),
      });

      return orderRepo.save(order);
    });
  }

  async registerArrival(
    id: number,
    registerArrivalDto: RegisterArrivalDto,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id },
        relations: { ordersDetails: { supply: true } },
      });

      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== OrderStatus.PENDING)
        throw new ConflictException(
          'Only pending orders can register an arrival',
        );

      this.assertDetailsMatchOrder(order, registerArrivalDto.details);

      if (registerArrivalDto.details.every((item) => item.quantity === 0))
        throw new BadRequestException('At least one supply must have arrived');

      let arrivalTotal = 0;

      for (const item of registerArrivalDto.details) {
        const detail = order.ordersDetails.find(
          (d) => d.supply.id === item.supplyId,
        )!;

        detail.arrivalQuantity = item.quantity;
        detail.arrivalSubtotal = item.quantity * Number(detail.unitPrice);
        arrivalTotal += detail.arrivalSubtotal;

        if (item.quantity > 0) {
          await this.suppliesService.increaseStock(
            item.supplyId,
            item.quantity,
            manager,
          );
        }
      }

      order.arrivalTotal = arrivalTotal;
      order.status = OrderStatus.RECEIVED;

      return orderRepo.save(order);
    });
  }

  /**
   * Los insumos informados deben coincidir exactamente con las líneas del
   * pedido: una línea que no llegó se envía en 0, no se omite. Así no hay
   * ambigüedad entre "no llegó" y "no lo informé".
   */
  private assertDetailsMatchOrder(
    order: Order,
    details: ArrivalDetailDto[],
  ): void {
    const received = details.map((item) => item.supplyId);

    if (new Set(received).size !== received.length)
      throw new BadRequestException('Duplicated supply in details');

    const ordered = order.ordersDetails.map((detail) => detail.supply.id);

    if (
      ordered.length !== received.length ||
      ordered.some((supplyId) => !received.includes(supplyId))
    )
      throw new BadRequestException(
        'Details must match the order lines exactly',
      );
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOneById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING)
      throw new ConflictException('Only pending orders can be cancelled');

    order.status = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }
}
