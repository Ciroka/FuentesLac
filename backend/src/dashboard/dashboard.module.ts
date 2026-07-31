import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Production } from '../production/entities/production.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products';
import { BatchModule } from '../batch';
import { ProduceActionGenerator } from './strategies/produce-action.generator';
import { PurchaseActionGenerator } from './strategies/purchase-action.generator';
import { CompositeActionGenerator } from './strategies/composite-action.generator';
import { ActionGenerator } from './strategies/action-generator.interface';

const actionGeneratorFactory = {
  provide: 'ACTION_GENERATORS',
  useFactory: (
    produce: ProduceActionGenerator,
    purchase: PurchaseActionGenerator,
  ): ActionGenerator => new CompositeActionGenerator([produce, purchase]),
  inject: [ProduceActionGenerator, PurchaseActionGenerator],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Production, Sale, Supply, Product]),
    ProductsModule,
    BatchModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    ProduceActionGenerator,
    PurchaseActionGenerator,
    actionGeneratorFactory,
  ],
})
export class DashboardModule {}
