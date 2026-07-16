import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchService } from './service/batch.service';
import { BatchController } from './controller/batch.controller';
import { BATCH_REPOSITORY } from './repository/batch.repository.interface';
import { BatchRepository } from './repository/batch.repository';
import { Batch } from './entities/batch.entity';
import { SalesDetailModule } from 'src/sales-detail';

@Module({
  imports: [TypeOrmModule.forFeature([Batch]), SalesDetailModule],
  controllers: [BatchController],
  providers: [
    BatchService,
    {
      provide: BATCH_REPOSITORY,
      useClass: BatchRepository,
    },
  ],
  exports: [TypeOrmModule, BatchService],
})
export class BatchModule {}
