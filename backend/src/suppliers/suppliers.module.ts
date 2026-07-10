import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliesModule } from '../supplies/supplies.module';
import { OrdersModule } from '../orders/orders.module';
import { SuppliersController } from './controller/suppliers.controller';
import { SuppliersService } from './service/suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { SUPPLIERS_REPOSITORY } from './repository/suppliers.repository.interface';
import { SuppliersRepository } from './repository/suppliers.repository';

@Module({
  imports: [
    SuppliesModule,
    OrdersModule,
    TypeOrmModule.forFeature([Supplier]),
  ],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    {
      provide: SUPPLIERS_REPOSITORY,
      useClass: SuppliersRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class SuppliersModule {}
