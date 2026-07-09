import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto, UpdateRecipeDto, QueryParamsRecipe } from '../dto';
import { RECIPE_REPOSITORY } from '../repository/recipe.repository.interface';
import type { RecipeRepository } from '../repository/recipe.repository.interface';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipeService {
  constructor(
    @Inject(RECIPE_REPOSITORY)
    private readonly recipeRepository: RecipeRepository,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return this.recipeRepository.create(createRecipeDto);
  }

  async findAll(params: QueryParamsRecipe) {
    const { page, limit, order, description } = params;
    return this.recipeRepository.findAll(page, limit, order, description);
  }

  async findOne(id: number): Promise<Recipe> {
    const recipe = await this.recipeRepository.finById(id);
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.findOne(id);

    if (updateRecipeDto.description !== undefined)
      recipe.description = updateRecipeDto.description;

    return this.recipeRepository.update(recipe);
  }

  async remove(id: number) {
    const recipe = await this.findOne(id);
    return this.recipeRepository.remove(recipe);
  }
}
