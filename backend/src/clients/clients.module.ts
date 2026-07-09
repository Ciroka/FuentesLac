import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesModule } from '../sales/sales.module';
import { ClientsController } from './controller/clients.controller';
import { ClientsService } from './service/clients.service';
import { Client } from './entities/client.entity';
import { Sale } from '../sales/entities/sale.entity';
import { CLIENTS_REPOSITORY } from './repository/clients.repository.interface';
import { ClientsRepository } from './repository/clients.repository';

@Module({
  imports: [SalesModule, TypeOrmModule.forFeature([Client, Sale])],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    {
      provide: CLIENTS_REPOSITORY,
      useClass: ClientsRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
