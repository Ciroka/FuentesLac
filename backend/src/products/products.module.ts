import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from '../categories/categories.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { SalesDetailModule } from '../sales-detail/sales-detail.module';
import { OrdersDetailModule } from '../orders-detail/orders-detail.module';
import { AdjustmentsModule } from '../adjustments/adjustments.module';
import { ProductsController } from './controller/products.controller';
import { PRODUCTS_REPOSITORY } from './repository/product.repository';
import { TypeOrmProductRespository } from './repository/TypeOrmProducts.repository';
import { ProductsService } from './service/products.service';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Order } from '../orders/entities/order.entity';
import { Adjustment } from '../adjustments/entities/adjustment.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Module({
  imports: [
    CategoriesModule,
    SuppliersModule,
    SalesDetailModule,
    OrdersDetailModule,
    AdjustmentsModule,
    TypeOrmModule.forFeature([
      Product,
      Category,
      Supplier,
      Sale,
      Order,
      Adjustment,
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: TypeOrmProductRespository,
    },
  ],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
