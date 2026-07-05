import { Module } from '@nestjs/common';
import { RecipeService } from './service/recipe.service';
import { RecipeController } from './controller/recipe.controller';

@Module({
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
