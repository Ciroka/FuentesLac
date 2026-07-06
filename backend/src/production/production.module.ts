import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductionDetailModule } from '../production-detail/production-detail.module';
import { ProductionController } from './controller/production.controller';
import { ProductionService } from './service/production.service';
import { Production } from './entities/production.entity';
import { ProductionDetail } from '../production-detail/entities/production-detail.entity';

@Module({
  imports: [
    ProductionDetailModule,
    TypeOrmModule.forFeature([Production, ProductionDetail]),
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [TypeOrmModule],
})
export class ProductionModule {}
