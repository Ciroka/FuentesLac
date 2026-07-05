import { Module } from '@nestjs/common';
import { CategoriesService } from './service/categories.service';
import { CategoriesController } from './controller/categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { ProductsService } from 'src/products/service/products.service';
import { CATEGORIES_REPOSITORY } from './repositories/category.repository';
import { TypeOrmCategoryRepository } from './repositories/TypeOrmCategories.repository';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), ProductsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, {provide: CATEGORIES_REPOSITORY, useClass: TypeOrmCategoryRepository}],
  exports: []
})
export class CategoriesModule {}
