import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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

  describe('registerArrival', () => {
    let orderRepo: { findOne: jest.Mock; save: jest.Mock };

    const orderWithLines = (): Order =>
      ({
        id: 1,
        status: OrderStatus.PENDING,
        arrivalTotal: 0,
        ordersDetails: [
          {
            id: 10,
            supply: { id: 5 },
            unitPrice: '100.00',
            orderedQuantity: 20,
            arrivalQuantity: 0,
            arrivalSubtotal: 0,
          },
          {
            id: 11,
            supply: { id: 6 },
            unitPrice: '50.00',
            orderedQuantity: 4,
            arrivalQuantity: 0,
            arrivalSubtotal: 0,
          },
        ],
      }) as unknown as Order;

    beforeEach(() => {
      orderRepo = {
        findOne: jest.fn(),
        save: jest.fn((order: Order) => Promise.resolve(order)),
      };
      const manager = { getRepository: jest.fn().mockReturnValue(orderRepo) };
      // Reemplaza el DataSource vacío del beforeEach externo por uno que
      // ejecuta el callback de la transacción con un manager falso.
      (service as unknown as { dataSource: DataSource }).dataSource = {
        transaction: jest.fn((cb: (m: unknown) => unknown) => cb(manager)),
      } as unknown as DataSource;
    });

    it('asigna cantidades, calcula el total y suma stock', async () => {
      const order = orderWithLines();
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.registerArrival(1, {
        details: [
          { supplyId: 5, quantity: 18 },
          { supplyId: 6, quantity: 4 },
        ],
      });

      expect(result.ordersDetails[0].arrivalQuantity).toBe(18);
      expect(result.ordersDetails[0].arrivalSubtotal).toBe(1800);
      expect(result.ordersDetails[1].arrivalSubtotal).toBe(200);
      expect(result.arrivalTotal).toBe(2000);
      expect(result.status).toBe(OrderStatus.RECEIVED);
      expect(suppliesService.increaseStock).toHaveBeenCalledTimes(2);
      expect(suppliesService.increaseStock).toHaveBeenCalledWith(
        5,
        18,
        expect.anything(),
      );
    });

    it('no suma stock de las líneas que llegaron en 0', async () => {
      orderRepo.findOne.mockResolvedValue(orderWithLines());

      const result = await service.registerArrival(1, {
        details: [
          { supplyId: 5, quantity: 20 },
          { supplyId: 6, quantity: 0 },
        ],
      });

      expect(result.arrivalTotal).toBe(2000);
      expect(suppliesService.increaseStock).toHaveBeenCalledTimes(1);
      expect(suppliesService.increaseStock).toHaveBeenCalledWith(
        5,
        20,
        expect.anything(),
      );
    });

    it('lanza NotFoundException si el pedido no existe', async () => {
      orderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.registerArrival(99, {
          details: [{ supplyId: 5, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el pedido no está pendiente', async () => {
      const order = orderWithLines();
      order.status = OrderStatus.RECEIVED;
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.registerArrival(1, {
          details: [
            { supplyId: 5, quantity: 1 },
            { supplyId: 6, quantity: 1 },
          ],
        }),
      ).rejects.toThrow(ConflictException);
      expect(suppliesService.increaseStock).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si falta una línea del pedido', async () => {
      orderRepo.findOne.mockResolvedValue(orderWithLines());

      await expect(
        service.registerArrival(1, { details: [{ supplyId: 5, quantity: 1 }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si viene un insumo que no es del pedido', async () => {
      orderRepo.findOne.mockResolvedValue(orderWithLines());

      await expect(
        service.registerArrival(1, {
          details: [
            { supplyId: 5, quantity: 1 },
            { supplyId: 99, quantity: 1 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si todas las cantidades son 0', async () => {
      orderRepo.findOne.mockResolvedValue(orderWithLines());

      await expect(
        service.registerArrival(1, {
          details: [
            { supplyId: 5, quantity: 0 },
            { supplyId: 6, quantity: 0 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(suppliesService.increaseStock).not.toHaveBeenCalled();
    });
  });
});
