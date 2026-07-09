import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductionModule } from '../production/production.module';
import { ProductsModule } from '../products/products.module';
import { ProductionDetailController } from './controller/production-detail.controller';
import { ProductionDetailService } from './service/production-detail.service';
import { ProductionDetail } from './entities/production-detail.entity';
import { Production } from '../production/entities/production.entity';
import { Product } from '../products/entities/product.entity';
import { PRODUCTION_DETAIL_REPOSITORY } from './repository/production-detail.repository.interface';
import { ProductionDetailRepositoryImpl } from './repository/production-detail.repository';

@Module({
  imports: [
    ProductionModule,
    ProductsModule,
    TypeOrmModule.forFeature([ProductionDetail, Production, Product]),
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
