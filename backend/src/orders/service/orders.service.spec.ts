import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { ORDERS_REPOSITORY } from '../repository/orders.repository.interface';
import { SuppliesService } from 'src/supplies/service/supplies.service';
import { OrderStatus } from 'src/shared/enums/orderStatus.enum';
import { Order } from '../entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: { findOneById: jest.Mock; save: jest.Mock };
  let suppliesService: { increaseStock: jest.Mock; findOne: jest.Mock };

  const pendingOrder = (): Order =>
    ({
      id: 1,
      status: OrderStatus.PENDING,
      arrivalTotal: 0,
      ordersDetails: [],
    }) as unknown as Order;

  beforeEach(async () => {
    ordersRepository = {
      findOneById: jest.fn(),
      save: jest.fn((order: Order) => Promise.resolve(order)),
    };
    suppliesService = { increaseStock: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ORDERS_REPOSITORY, useValue: ordersRepository },
        { provide: DataSource, useValue: {} },
        { provide: SuppliesService, useValue: suppliesService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cancel', () => {
    it('pasa el pedido a CANCELLED', async () => {
      const order = pendingOrder();
      ordersRepository.findOneById.mockResolvedValue(order);

      const result = await service.cancel(1);

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(ordersRepository.save).toHaveBeenCalledWith(order);
    });

    it('no toca el stock', async () => {
      ordersRepository.findOneById.mockResolvedValue(pendingOrder());

      await service.cancel(1);

      expect(suppliesService.increaseStock).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el pedido no existe', async () => {
      ordersRepository.findOneById.mockResolvedValue(null);

      await expect(service.cancel(99)).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el pedido ya fue recibido', async () => {
      const order = pendingOrder();
      order.status = OrderStatus.RECEIVED;
      ordersRepository.findOneById.mockResolvedValue(order);

      await expect(service.cancel(1)).rejects.toThrow(ConflictException);
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si el pedido ya fue cancelado', async () => {
      const order = pendingOrder();
      order.status = OrderStatus.CANCELLED;
      ordersRepository.findOneById.mockResolvedValue(order);

      await expect(service.cancel(1)).rejects.toThrow(ConflictException);
    });
  });
});
