import { Module } from '@nestjs/common';
import { ProductsService } from './service/products.service';
import { ProductsController } from './controller/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { PRODUCTS_REPOSITORY } from './repository/product.repository';
import { TypeOrmProductRespository } from './repository/TypeOrmProducts.repository';
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: PRODUCTS_REPOSITORY, useClass: TypeOrmProductRespository },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
