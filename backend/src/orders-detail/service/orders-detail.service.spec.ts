import { Test, TestingModule } from '@nestjs/testing';
import { OrdersDetailService } from './orders-detail.service';

describe('OrdersDetailService', () => {
  let service: OrdersDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersDetailService],
    }).compile();

    service = module.get<OrdersDetailService>(OrdersDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
