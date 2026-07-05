import { Injectable } from '@nestjs/common';
import { CreateRecipeDetailDto } from '../dto/create-recipe-detail.dto';
import { UpdateRecipeDetailDto } from '../dto/update-recipe-detail.dto';

@Injectable()
export class RecipeDetailService {
  create(createRecipeDetailDto: CreateRecipeDetailDto) {
    return 'This action adds a new recipeDetail';
  }

  findAll() {
    return `This action returns all recipeDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipeDetail`;
  }

  update(id: number, updateRecipeDetailDto: UpdateRecipeDetailDto) {
    return `This action updates a #${id} recipeDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipeDetail`;
  }
}
