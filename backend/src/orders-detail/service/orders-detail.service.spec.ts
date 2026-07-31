import { Test, TestingModule } from '@nestjs/testing';
import { OrdersDetailService } from './orders-detail.service';
import { ORDERS_DETAIL_REPOSITORY } from '../repository/orders-detail.repository.interface';

describe('OrdersDetailService', () => {
  let service: OrdersDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersDetailService,
        { provide: ORDERS_DETAIL_REPOSITORY, useValue: {} },
      ],
    }).compile();

    service = module.get<OrdersDetailService>(OrdersDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
