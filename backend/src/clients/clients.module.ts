import { Module } from '@nestjs/common';
import { ClientsService } from './service/clients.service';
import { ClientsController } from './controller/clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
