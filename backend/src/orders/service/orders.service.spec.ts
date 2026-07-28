import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { ORDERS_REPOSITORY } from '../repository/orders.repository.interface';
import { SuppliesService } from 'src/supplies/service/supplies.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ORDERS_REPOSITORY, useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: SuppliesService, useValue: {} },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
