import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchService } from './service/batch.service';
import { BatchController } from './controller/batch.controller';
import { BATCH_REPOSITORY } from './repository/batch.repository.interface';
import { BatchRepository } from './repository/batch.repository';
import { Batch } from './entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Batch])],
  controllers: [BatchController],
  providers: [
    BatchService,
    {
      provide: BATCH_REPOSITORY,
      useClass: BatchRepository,
    },
  ],
})
export class BatchModule {}
