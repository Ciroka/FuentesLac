import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './controller/products.controller';
import { PRODUCTS_REPOSITORY } from './repository/products.repository.interface';
import { ProductRepository } from './repository/products.repository';
import { ProductsService } from './service/products.service';
import { Product } from './entities/product.entity';
import { BatchModule } from 'src/batch';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), BatchModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
