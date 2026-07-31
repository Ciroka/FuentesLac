import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliesXproductionDetailController } from './controller/supplies-xproduction-detail.controller';
import { SuppliesXproductionDetailService } from './service/supplies-xproduction-detail.service';
import { SuppliesXproductionDetail } from './entities/supplies-xproduction-detail.entity';
import { SUPPLIES_XPRODUCTION_DETAIL_REPOSITORY } from './repository/supplies-xproduction-detail.repository.interface';
import { SuppliesXproductionDetailRepository } from './repository/supplies-xproduction-detail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SuppliesXproductionDetail])],
  controllers: [SuppliesXproductionDetailController],
  providers: [
    SuppliesXproductionDetailService,
    {
      provide: SUPPLIES_XPRODUCTION_DETAIL_REPOSITORY,
      useClass: SuppliesXproductionDetailRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class SuppliesXproductionDetailModule {}
