import { Module } from '@nestjs/common';
import { AdjustmentsService } from './service/adjustments.service';
import { AdjustmentsController } from './controller/adjustments.controller';

@Module({
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService],
})
export class AdjustmentsModule {}
