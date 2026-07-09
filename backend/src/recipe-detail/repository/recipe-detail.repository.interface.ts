import { RecipeDetail } from '../entities/recipe-detail.entity';

export const RECIPE_DETAIL_REPOSITORY = 'RECIPE_DETAIL_REPOSITORY';

export interface RecipeDetailRepository {
  findAll(): Promise<RecipeDetail[]>;
  findByRecipe(recipeId: number): Promise<RecipeDetail[]>;
  finById(id: number): Promise<RecipeDetail | null>;
  create(input: Partial<RecipeDetail>): Promise<RecipeDetail>;
  update(detail: RecipeDetail): Promise<RecipeDetail>;
  remove(detail: RecipeDetail): Promise<RecipeDetail>;
}
