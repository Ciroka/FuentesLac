import { Module } from '@nestjs/common';
import { SalesDetailService } from './service/sales-detail.service';
import { SalesDetailController } from './controller/sales-detail.controller';

@Module({
  controllers: [SalesDetailController],
  providers: [SalesDetailService],
})
export class SalesDetailModule {}
