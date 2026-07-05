import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { OrdersDetailController } from './controller/orders-detail.controller';
import { OrdersDetailService } from './service/orders-detail.service';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { OrdersDetail } from './entities/orders-detail.entity';

@Module({
  imports: [
    OrdersModule,
    ProductsModule,
    TypeOrmModule.forFeature([Order, Product, OrdersDetail]),
  ],
  controllers: [OrdersDetailController],
  providers: [OrdersDetailService],
  exports: [TypeOrmModule],
})
export class OrdersDetailModule {}
