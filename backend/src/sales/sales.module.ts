import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesDetailModule } from '../sales-detail/sales-detail.module';
import { ClientsModule } from '../clients/clients.module';
import { SalesController } from './controller/sales.controller';
import { SalesService } from './service/sales.service';
import { Sale } from './entities/sale.entity';
import { SALES_REPOSITORY } from './repository/sales.repository.interface';
import { SalesRepositoryImpl } from './repository/sales.repository';
import { BatchModule } from 'src/batch';

@Module({
  imports: [
    SalesDetailModule,
    ClientsModule,
    BatchModule,
    TypeOrmModule.forFeature([Sale]),
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
    {
      provide: SALES_REPOSITORY,
      useClass: SalesRepositoryImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class SalesModule {}
