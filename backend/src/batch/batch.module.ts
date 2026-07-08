import { Module } from '@nestjs/common';
import { BatchService } from './service/batch.service';
import { BatchController } from './controller/batch.controller';

@Module({
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
