import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from '../products/products.module';
import { SalesDetailController } from './controller/sales-detail.controller';
import { SalesDetailService } from './service/sales-detail.service';
import { SalesDetail } from './entities/sales-detail.entity';
import { SALES_DETAIL_REPOSITORY } from './repository/sales-detail.repository.interface';
import { SalesDetailRepositoryImpl } from './repository/sales-detail.repository';

@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forFeature([SalesDetail]),
  ],
  controllers: [SalesDetailController],
  providers: [
    SalesDetailService,
    {
      provide: SALES_DETAIL_REPOSITORY,
      useClass: SalesDetailRepositoryImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class SalesDetailModule {}
