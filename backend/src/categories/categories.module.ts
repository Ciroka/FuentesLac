import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from '../products/products.module';
import { CategoriesController } from './controller/categories.controller';
import { CategoriesService } from './service/categories.service';
import { TypeOrmCategoryRepository } from './repositories/TypeOrmCategories.repository';
import { CATEGORIES_REPOSITORY } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Category, Product])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORIES_REPOSITORY,
      useClass: TypeOrmCategoryRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
