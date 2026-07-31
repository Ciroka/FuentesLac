import { Test, TestingModule } from '@nestjs/testing';
import { OrdersDetailController } from './orders-detail.controller';
import { OrdersDetailService } from '../service/orders-detail.service';
import { ORDERS_DETAIL_REPOSITORY } from '../repository/orders-detail.repository.interface';

describe('OrdersDetailController', () => {
  let controller: OrdersDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersDetailController],
      providers: [
        OrdersDetailService,
        { provide: ORDERS_DETAIL_REPOSITORY, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrdersDetailController>(OrdersDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
