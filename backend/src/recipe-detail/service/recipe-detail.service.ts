import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDetailDto, UpdateRecipeDetailDto } from '../dto';
import { RECIPE_DETAIL_REPOSITORY } from '../repository/recipe-detail.repository.interface';
import type { RecipeDetailRepository } from '../repository/recipe-detail.repository.interface';
import { RecipeDetail } from '../entities/recipe-detail.entity';

@Injectable()
export class RecipeDetailService {
  constructor(
    @Inject(RECIPE_DETAIL_REPOSITORY)
    private readonly detailRepository: RecipeDetailRepository,
  ) {}

  async create(
    createRecipeDetailDto: CreateRecipeDetailDto,
  ): Promise<RecipeDetail> {
    return this.detailRepository.create(createRecipeDetailDto);
  }

  async findAll() {
    return this.detailRepository.findAll();
  }

  async findOne(id: number): Promise<RecipeDetail> {
    const detail = await this.detailRepository.finById(id);
    if (!detail) throw new NotFoundException('Recipe detail not found');
    return detail;
  }

  async findByRecipe(recipeId: number) {
    return this.detailRepository.findByRecipe(recipeId);
  }

  async update(id: number, updateRecipeDetailDto: UpdateRecipeDetailDto) {
    const detail = await this.findOne(id);
    if (updateRecipeDetailDto.quantity !== undefined)
      detail.quantity = updateRecipeDetailDto.quantity;
    return this.detailRepository.update(detail);
  }

  async remove(id: number) {
    const detail = await this.findOne(id);
    return this.detailRepository.remove(detail);
  }
}
