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
import { SUPPLIES_REPOSITORY } from './repository/supplies.repository.interface';
import { SuppliesRepository } from './repository/supplies.repository';

@Module({
  imports: [
    SuppliersModule,
    CategoriesModule,
    RecipeModule,
    TypeOrmModule.forFeature([Supply, Supplier, Category, Recipe]),
  ],
  controllers: [SuppliesController],
  providers: [
    SuppliesService,
    {
      provide: SUPPLIES_REPOSITORY,
      useClass: SuppliesRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class SuppliesModule {}
