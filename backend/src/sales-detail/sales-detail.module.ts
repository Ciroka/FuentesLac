import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from '../products/products.module';
import { SalesModule } from '../sales/sales.module';
import { SalesDetailController } from './controller/sales-detail.controller';
import { SalesDetailService } from './service/sales-detail.service';
import { SalesDetail } from './entities/sales-detail.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    ProductsModule,
    SalesModule,
    TypeOrmModule.forFeature([SalesDetail, Sale, Product]),
  ],
  controllers: [SalesDetailController],
  providers: [SalesDetailService],
  exports: [TypeOrmModule],
})
export class SalesDetailModule {}
