import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliesModule } from '../supplies/supplies.module';
import { OrdersModule } from '../orders/orders.module';
import { SuppliersController } from './controller/suppliers.controller';
import { SuppliersService } from './service/suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    SuppliesModule,
    OrdersModule,
    TypeOrmModule.forFeature([Supplier, Supply, Order]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [TypeOrmModule],
})
export class SuppliersModule {}
