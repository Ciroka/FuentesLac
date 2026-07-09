import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeDetailModule } from '../recipe-detail/recipe-detail.module';
import { ProductsModule } from '../products/products.module';
import { RecipeController } from './controller/recipe.controller';
import { RecipeService } from './service/recipe.service';
import { Recipe } from './entities/recipe.entity';
import { Product } from '../products/entities/product.entity';
import { RecipeDetail } from '../recipe-detail/entities/recipe-detail.entity';
import { RECIPE_REPOSITORY } from './repository/recipe.repository.interface';
import { RecipeRepositoryImpl } from './repository/recipe.repository';

@Module({
  imports: [
    ProductsModule,
    RecipeDetailModule,
    TypeOrmModule.forFeature([Recipe, RecipeDetail, Product]),
  ],
  controllers: [RecipeController],
  providers: [
    RecipeService,
    {
      provide: RECIPE_REPOSITORY,
      useClass: RecipeRepositoryImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class RecipeModule {}
