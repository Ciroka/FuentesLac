import { Module } from '@nestjs/common';
import { AdjustmentsService } from './service/adjustments.service';
import { AdjustmentsController } from './controller/adjustments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Adjustment } from './entities/adjustment.entity';
import { ProductsModule } from '../products/products.module';
import { ADJUSTMENTS_REPOSITORY } from './repository/adjustments.repository.interface';
import { AdjustmentsRepository } from './repository/adjustments.repository';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Adjustment])],
  controllers: [AdjustmentsController],
  providers: [
    AdjustmentsService,
    {
      provide: ADJUSTMENTS_REPOSITORY,
      useClass: AdjustmentsRepository,
    },
  ],
})
export class AdjustmentsModule {}
