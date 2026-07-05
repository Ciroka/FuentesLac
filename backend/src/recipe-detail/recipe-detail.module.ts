import { Module } from '@nestjs/common';
import { RecipeDetailService } from './service/recipe-detail.service';
import { RecipeDetailController } from './controller/recipe-detail.controller';

@Module({
  controllers: [RecipeDetailController],
  providers: [RecipeDetailService],
})
export class RecipeDetailModule {}
