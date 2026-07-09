import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateProductionDto,
  UpdateProductionDto,
  QueryParamsProduction,
} from '../dto';
import { PRODUCTION_REPOSITORY } from '../repository/production.repository.interface';
import type { ProductionRepository } from '../repository/production.repository.interface';
import { Production } from '../entities/production.entity';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(PRODUCTION_REPOSITORY)
    private readonly productionRepository: ProductionRepository,
  ) {}

  async create(createProductionDto: CreateProductionDto): Promise<Production> {
    return this.productionRepository.create(createProductionDto);
  }

  async findAll(params: QueryParamsProduction) {
    const { page, limit, order } = params;
    return this.productionRepository.findAll(page, limit, order);
  }

  async findOne(id: number): Promise<Production> {
    const production = await this.productionRepository.finById(id);
    if (!production) throw new NotFoundException('Production not found');
    return production;
  }

  async update(id: number, updateProductionDto: UpdateProductionDto) {
    const production = await this.findOne(id);
    return this.productionRepository.update(production);
  }

  async remove(id: number) {
    const production = await this.findOne(id);
    return this.productionRepository.remove(production);
  }
}
