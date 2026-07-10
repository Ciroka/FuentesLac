import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductionDetailController } from './controller/production-detail.controller';
import { ProductionDetailService } from './service/production-detail.service';
import { ProductionDetail } from './entities/production-detail.entity';
import { PRODUCTION_DETAIL_REPOSITORY } from './repository/production-detail.repository.interface';
import { ProductionDetailRepositoryImpl } from './repository/production-detail.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionDetail]),
  ],
  controllers: [ProductionDetailController],
  providers: [
    ProductionDetailService,
    {
      provide: PRODUCTION_DETAIL_REPOSITORY,
      useClass: ProductionDetailRepositoryImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class ProductionDetailModule {}
