import { Module } from '@nestjs/common';
import { ProductionService } from './service/production.service';
import { ProductionController } from './controller/production.controller';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
