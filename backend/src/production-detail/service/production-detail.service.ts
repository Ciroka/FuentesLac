import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductionDetailDto, UpdateProductionDetailDto } from '../dto';
import { PRODUCTION_DETAIL_REPOSITORY } from '../repository/production-detail.repository.interface';
import type { ProductionDetailRepository } from '../repository/production-detail.repository.interface';
import { ProductionDetail } from '../entities/production-detail.entity';

@Injectable()
export class ProductionDetailService {
  constructor(
    @Inject(PRODUCTION_DETAIL_REPOSITORY)
    private readonly detailRepository: ProductionDetailRepository,
  ) {}

  async create(
    createProductionDetailDto: CreateProductionDetailDto,
  ): Promise<ProductionDetail> {
    return this.detailRepository.create(createProductionDetailDto);
  }

  async findAll() {
    return this.detailRepository.findAll();
  }

  async findOne(id: number): Promise<ProductionDetail> {
    const detail = await this.detailRepository.finById(id);
    if (!detail) throw new NotFoundException('Production detail not found');
    return detail;
  }

  async findByProduction(productionId: number) {
    return this.detailRepository.findByProduction(productionId);
  }

  async update(
    id: number,
    updateProductionDetailDto: UpdateProductionDetailDto,
  ) {
    const detail = await this.findOne(id);
    if (updateProductionDetailDto.quantity !== undefined)
      detail.quantity = updateProductionDetailDto.quantity;
    return this.detailRepository.update(detail);
  }

  async remove(id: number) {
    const detail = await this.findOne(id);
    return this.detailRepository.remove(detail);
  }
}
