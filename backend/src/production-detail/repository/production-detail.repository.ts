import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductionDetailRepository } from './production-detail.repository.interface';
import { ProductionDetail } from '../entities/production-detail.entity';

@Injectable()
export class ProductionDetailRepositoryImpl implements ProductionDetailRepository {
  constructor(
    @InjectRepository(ProductionDetail)
    private readonly detailRepository: Repository<ProductionDetail>,
  ) {}

  async findAll(): Promise<ProductionDetail[]> {
    return this.detailRepository.find({
      relations: { production: true, product: true },
    });
  }

  async findByProduction(productionId: number): Promise<ProductionDetail[]> {
    return this.detailRepository.find({
      where: { production: { id: productionId } as any },
      relations: { product: true },
    });
  }

  async finById(id: number): Promise<ProductionDetail | null> {
    return this.detailRepository.findOne({
      where: { id },
      relations: { production: true, product: true },
    });
  }

  async create(input: Partial<ProductionDetail>): Promise<ProductionDetail> {
    return this.detailRepository.save(input);
  }

  async update(detail: ProductionDetail): Promise<ProductionDetail> {
    return this.detailRepository.save(detail);
  }

  async remove(detail: ProductionDetail): Promise<ProductionDetail> {
    return this.detailRepository.remove(detail);
  }
}
