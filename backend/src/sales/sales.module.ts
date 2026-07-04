import { Module } from '@nestjs/common';
import { SalesService } from './service/sales.service';
import { SalesController } from './controller/sales.controller';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
