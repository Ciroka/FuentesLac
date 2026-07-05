import { Module } from '@nestjs/common';
import { SuppliesService } from './service/supplies.service';
import { SuppliesController } from './controller/supplies.controller';

@Module({
  controllers: [SuppliesController],
  providers: [SuppliesService],
})
export class SuppliesModule {}
