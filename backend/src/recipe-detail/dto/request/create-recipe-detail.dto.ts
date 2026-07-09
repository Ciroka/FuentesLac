import { IsInt, IsPositive } from 'class-validator';

export class CreateRecipeDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  recipeId!: number;

  @IsInt()
  @IsPositive()
  supplyId!: number;
}
