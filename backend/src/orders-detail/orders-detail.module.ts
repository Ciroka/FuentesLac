import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersDetailController } from './controller/orders-detail.controller';
import { OrdersDetailService } from './service/orders-detail.service';
import { OrdersDetail } from './entities/orders-detail.entity';
import { ORDERS_DETAIL_REPOSITORY } from './repository/orders-detail.repository.interface';
import { OrdersDetailRepository } from './repository/orders-detail.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdersDetail]),
  ],
  controllers: [OrdersDetailController],
  providers: [
    OrdersDetailService,
    {
      provide: ORDERS_DETAIL_REPOSITORY,
      useClass: OrdersDetailRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class OrdersDetailModule {}
