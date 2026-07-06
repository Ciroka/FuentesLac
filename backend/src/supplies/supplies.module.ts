import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliersModule } from '../suppliers/suppliers.module';
import { CategoriesModule } from '../categories/categories.module';
import { RecipeModule } from '../recipe/recipe.module';
import { SuppliesController } from './controller/supplies.controller';
import { SuppliesService } from './service/supplies.service';
import { Supply } from './entities/supply.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Category } from '../categories/entities/category.entity';
import { Recipe } from '../recipe/entities/recipe.entity';

@Module({
  imports: [
    SuppliersModule,
    CategoriesModule,
    RecipeModule,
    TypeOrmModule.forFeature([Supply, Supplier, Category, Recipe]),
  ],
  controllers: [SuppliesController],
  providers: [SuppliesService],
  exports: [TypeOrmModule],
})
export class SuppliesModule {}
