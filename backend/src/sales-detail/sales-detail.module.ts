import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesDetailController } from './controller/sales-detail.controller';
import { SalesDetailService } from './service/sales-detail.service';
import { SalesDetail } from './entities/sales-detail.entity';
import { SALES_DETAIL_REPOSITORY } from './repository/sales-detail.repository.interface';
import { SalesDetailRepository } from './repository/sales-detail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SalesDetail])],
  controllers: [SalesDetailController],
  providers: [
    SalesDetailService,
    {
      provide: SALES_DETAIL_REPOSITORY,
      useClass: SalesDetailRepository,
    },
  ],
  exports: [TypeOrmModule, SalesDetailService],
})
export class SalesDetailModule {}
