import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateRecipeDto } from '../dto';
import { Recipe } from '../entities/recipe.entity';

export const RECIPE_REPOSITORY = 'RECIPE_REPOSITORY';

export interface RecipeRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    description?: string,
  ): Promise<PaginatedResult<Recipe>>;
  finById(id: number): Promise<Recipe | null>;
  create(input: CreateRecipeDto): Promise<Recipe>;
  update(recipe: Recipe): Promise<Recipe>;
  remove(recipe: Recipe): Promise<Recipe>;
}
