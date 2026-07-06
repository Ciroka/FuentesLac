import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesModule } from '../sales/sales.module';
import { ClientsController } from './controller/clients.controller';
import { ClientsService } from './service/clients.service';
import { Client } from './entities/client.entity';
import { Sale } from '../sales/entities/sale.entity';

@Module({
  imports: [SalesModule, TypeOrmModule.forFeature([Client, Sale])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
