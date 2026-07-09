import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliersModule } from '../suppliers/suppliers.module';
import { OrdersDetailModule } from '../orders-detail/orders-detail.module';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { OrdersDetail } from '../orders-detail/entities/orders-detail.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Order } from './entities/order.entity';
import { ORDERS_REPOSITORY } from './repository/orders.repository.interface';
import { OrdersRepository } from './repository/orders.repository';

@Module({
  imports: [
    OrdersDetailModule,
    SuppliersModule,
    TypeOrmModule.forFeature([Order, OrdersDetail, Supplier]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: ORDERS_REPOSITORY,
      useClass: OrdersRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
