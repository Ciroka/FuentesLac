import { Module } from '@nestjs/common';
import { ProductionDetailService } from './service/production-detail.service';
import { ProductionDetailController } from './controller/production-detail.controller';

@Module({
  controllers: [ProductionDetailController],
  providers: [ProductionDetailService],
})
export class ProductionDetailModule {}
