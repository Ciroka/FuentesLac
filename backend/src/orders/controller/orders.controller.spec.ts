import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../service/orders.service';
import { ORDERS_REPOSITORY } from '../repository/orders.repository.interface';
import { SuppliesService } from 'src/supplies/service/supplies.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        { provide: ORDERS_REPOSITORY, useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: SuppliesService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
