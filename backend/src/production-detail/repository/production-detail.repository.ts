import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductionDetailRepository } from './production-detail.repository.interface';
import { ProductionDetail } from '../entities/production-detail.entity';
import { CreateProductionDetailDto } from '../dto';

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
      where: { production: { id: productionId }},
      relations: { product: true },
    });
  }

  async finById(id: number): Promise<ProductionDetail | null> {
    return this.detailRepository.findOne({
      where: { id },
      relations: { production: true, product: true },
    });
  }

  async create(input: Partial<ProductionDetail>, manager?: EntityManager): Promise<ProductionDetail> {
    const repo = manager ? manager.getRepository(ProductionDetail) : this.detailRepository;
    return repo.save(input);
  }

  async update(detail: ProductionDetail, manager?: EntityManager): Promise<ProductionDetail> {
    const repo = manager ? manager.getRepository(ProductionDetail) : this.detailRepository;
    return repo.save(detail);
  }

  async remove(detail: ProductionDetail,  manager?: EntityManager): Promise<ProductionDetail> {
    const repo = manager ? manager.getRepository(ProductionDetail) : this.detailRepository;
    return repo.remove(detail);
  }
}
