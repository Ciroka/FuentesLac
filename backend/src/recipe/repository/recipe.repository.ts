import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateRecipeDto } from '../dto';
import { RecipeRepository } from './recipe.repository.interface';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipeRepositoryImpl implements RecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    description?: string,
  ): Promise<PaginatedResult<Recipe>> {
    const query = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.details', 'details');

    if (description) {
      query.where('recipe.description ILIKE :description', {
        description: `%${description}%`,
      });
    }

    query.orderBy('recipe.id', order);
    const offset = (page - 1) * limit;

    const [items, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async finById(id: number): Promise<Recipe | null> {
    return this.recipeRepository.findOne({
      where: { id },
      relations: { details: true },
    });
  }

  async create(input: CreateRecipeDto): Promise<Recipe> {
    return this.recipeRepository.save(input);
  }

  async update(recipe: Recipe): Promise<Recipe> {
    return this.recipeRepository.save(recipe);
  }

  async remove(recipe: Recipe): Promise<Recipe> {
    return this.recipeRepository.remove(recipe);
  }
}
