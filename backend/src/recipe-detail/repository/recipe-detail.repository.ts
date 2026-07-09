import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RecipeDetailRepository } from './recipe-detail.repository.interface';
import { RecipeDetail } from '../entities/recipe-detail.entity';

@Injectable()
export class RecipeDetailRepositoryImpl implements RecipeDetailRepository {
  constructor(
    @InjectRepository(RecipeDetail)
    private readonly detailRepository: Repository<RecipeDetail>,
  ) {}

  async findAll(): Promise<RecipeDetail[]> {
    return this.detailRepository.find({
      relations: { recipe: true, supply: true },
    });
  }

  async findByRecipe(recipeId: number): Promise<RecipeDetail[]> {
    return this.detailRepository.find({
      where: { recipe: { id: recipeId } as any },
      relations: { supply: true },
    });
  }

  async finById(id: number): Promise<RecipeDetail | null> {
    return this.detailRepository.findOne({
      where: { id },
      relations: { recipe: true, supply: true },
    });
  }

  async create(input: Partial<RecipeDetail>): Promise<RecipeDetail> {
    return this.detailRepository.save(input);
  }

  async update(detail: RecipeDetail): Promise<RecipeDetail> {
    return this.detailRepository.save(detail);
  }

  async remove(detail: RecipeDetail): Promise<RecipeDetail> {
    return this.detailRepository.remove(detail);
  }
}
