import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { OrdersDetailController } from './controller/orders-detail.controller';
import { OrdersDetailService } from './service/orders-detail.service';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { OrdersDetail } from './entities/orders-detail.entity';
import { ORDERS_DETAIL_REPOSITORY } from './repository/orders-detail.repository.interface';
import { OrdersDetailRepository } from './repository/orders-detail.repository';

@Module({
  imports: [
    OrdersModule,
    ProductsModule,
    TypeOrmModule.forFeature([Order, Product, OrdersDetail]),
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
