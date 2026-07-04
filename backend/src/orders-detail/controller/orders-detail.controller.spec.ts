import { Test, TestingModule } from '@nestjs/testing';
import { OrdersDetailController } from './orders-detail.controller';
import { OrdersDetailService } from '../orders-detail.service';

describe('OrdersDetailController', () => {
  let controller: OrdersDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersDetailController],
      providers: [OrdersDetailService],
    }).compile();

    controller = module.get<OrdersDetailController>(OrdersDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
