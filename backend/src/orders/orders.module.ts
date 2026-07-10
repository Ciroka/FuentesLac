import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { Order } from './entities/order.entity';
import { ORDERS_REPOSITORY } from './repository/orders.repository.interface';
import { OrdersRepository } from './repository/orders.repository';
import { SuppliesModule } from 'src/supplies';

@Module({
  imports: [
    SuppliesModule,
    TypeOrmModule.forFeature([Order]),
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
