import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductionDetailDto, UpdateProductionDetailDto } from '../dto';
import { PRODUCTION_DETAIL_REPOSITORY } from '../repository/production-detail.repository.interface';
import type { ProductionDetailRepository } from '../repository/production-detail.repository.interface';
import { ProductionDetail } from '../entities/production-detail.entity';
import { Production } from 'src/production/entities/production.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class ProductionDetailService {
  constructor(
    @Inject(PRODUCTION_DETAIL_REPOSITORY)
    private readonly detailRepository: ProductionDetailRepository,
  ) {}

  async findAll(): Promise<ProductionDetail[]> {
    return this.detailRepository.findAll();
  }

  async findOne(id: number): Promise<ProductionDetail> {
    const detail = await this.detailRepository.finById(id);
    if (!detail) throw new NotFoundException('Production detail not found');
    return detail;
  }
  
  async findByProduction(productionId: number, manager?: EntityManager): Promise<ProductionDetail[]> {
    return this.detailRepository.findByProduction(productionId);
  }
  
  async create(
    createProductionDetailDto: Partial<ProductionDetail>,
    manager?: EntityManager
  ): Promise<ProductionDetail> {
    return this.detailRepository.create(createProductionDetailDto, manager);
  }

  async update(
    detail: ProductionDetail,
    manager?: EntityManager
  ): Promise<ProductionDetail> {
    return this.detailRepository.update(detail, manager);
  }

  async remove(detail: ProductionDetail, manager?: EntityManager): Promise<ProductionDetail> {
    return this.detailRepository.remove(detail, manager);
  }
}
