import { Module } from '@nestjs/common';
import { OrdersDetailService } from './service/orders-detail.service';
import { OrdersDetailController } from './controller/orders-detail.controller';

@Module({
  controllers: [OrdersDetailController],
  providers: [OrdersDetailService],
})
export class OrdersDetailModule {}
