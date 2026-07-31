import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { CategoriesController } from './controller/categories.controller';
import { CategoriesService } from './service/categories.service';
import { CategoriesRepository } from './repository/categories.repository';
import { CATEGORIES_REPOSITORY } from './repository/categories.repository.interface';
import { Category } from './entities/category.entity';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Category])],
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
