import { Module } from '@nestjs/common';
import { AdjustmentsService } from './service/adjustments.service';
import { AdjustmentsController } from './controller/adjustments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Adjustment } from './entities/adjustment.entity';
import { ProductsModule } from '../products/products.module';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Adjustment, Product])],
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService],
})
export class AdjustmentsModule {}
