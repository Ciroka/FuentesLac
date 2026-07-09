import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeModule } from '../recipe/recipe.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { RecipeDetailController } from './controller/recipe-detail.controller';
import { RecipeDetailService } from './service/recipe-detail.service';
import { RecipeDetail } from './entities/recipe-detail.entity';
import { Recipe } from '../recipe/entities/recipe.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { RECIPE_DETAIL_REPOSITORY } from './repository/recipe-detail.repository.interface';
import { RecipeDetailRepositoryImpl } from './repository/recipe-detail.repository';

@Module({
  imports: [
    RecipeModule,
    SuppliersModule,
    TypeOrmModule.forFeature([RecipeDetail, Recipe, Supplier]),
  ],
  controllers: [RecipeDetailController],
  providers: [
    RecipeDetailService,
    {
      provide: RECIPE_DETAIL_REPOSITORY,
      useClass: RecipeDetailRepositoryImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class RecipeDetailModule {}
