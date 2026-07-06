import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesDetailModule } from '../sales-detail/sales-detail.module';
import { ClientsModule } from '../clients/clients.module';
import { SalesController } from './controller/sales.controller';
import { SalesService } from './service/sales.service';
import { SalesDetail } from '../sales-detail/entities/sales-detail.entity';
import { Sale } from './entities/sale.entity';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [
    SalesDetailModule,
    ClientsModule,
    TypeOrmModule.forFeature([Sale, SalesDetail, Client]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [TypeOrmModule],
})
export class SalesModule {}
