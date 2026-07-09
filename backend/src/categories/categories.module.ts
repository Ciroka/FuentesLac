import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { CategoriesController } from './controller/categories.controller';
import { CategoriesService } from './service/categories.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { CATEGORIES_REPOSITORY } from './repositories/categories.repository.interface';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Category, Product])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORIES_REPOSITORY,
      useClass: CategoriesRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
