import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductionDetailModule } from '../production-detail/production-detail.module';
import { ProductionController } from './controller/production.controller';
import { ProductionService } from './service/production.service';
import { Production } from './entities/production.entity';
import { PRODUCTION_REPOSITORY } from './repository/production.repository.interface';
import { ProductionRepositoryImpl } from './repository/production.repository';
import { ProductsModule } from 'src/products';
import { SuppliesModule } from 'src/supplies';

@Module({
  imports: [
    ProductionDetailModule,
    ProductsModule,
    SuppliesModule,
    TypeOrmModule.forFeature([Production]),
  ],
  controllers: [ProductionController],
  providers: [
    ProductionService,
    {
      provide: PRODUCTION_REPOSITORY,
      useClass: ProductionRepositoryImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class ProductionModule {}
