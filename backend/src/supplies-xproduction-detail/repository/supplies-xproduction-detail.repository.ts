import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ISuppliesXproductionDetailRepository } from './supplies-xproduction-detail.repository.interface';
import { SuppliesXproductionDetail } from '../entities/supplies-xproduction-detail.entity';

@Injectable()
export class SuppliesXproductionDetailRepository implements ISuppliesXproductionDetailRepository {
  constructor(
    @InjectRepository(SuppliesXproductionDetail)
    private readonly detailRepository: Repository<SuppliesXproductionDetail>,
  ) {}

  async findAll(): Promise<SuppliesXproductionDetail[]> {
    return this.detailRepository.find({
      relations: { supply: true, productionDetail: true },
    });
  }

  async finById(
    id: number,
    manager?: EntityManager,
  ): Promise<SuppliesXproductionDetail | null> {
    const repo = manager
      ? manager.getRepository(SuppliesXproductionDetail)
      : this.detailRepository;
    return repo.findOne({
      where: { id },
      relations: { supply: true, productionDetail: true },
    });
  }

  async create(
    input: Partial<SuppliesXproductionDetail>,
    manager?: EntityManager,
  ): Promise<SuppliesXproductionDetail> {
    const repo = manager
      ? manager.getRepository(SuppliesXproductionDetail)
      : this.detailRepository;
    return repo.save(input);
  }

  async update(
    detail: SuppliesXproductionDetail,
    manager?: EntityManager,
  ): Promise<SuppliesXproductionDetail> {
    const repo = manager
      ? manager.getRepository(SuppliesXproductionDetail)
      : this.detailRepository;
    return repo.save(detail);
  }

  async remove(
    detail: SuppliesXproductionDetail,
  ): Promise<SuppliesXproductionDetail> {
    return this.detailRepository.remove(detail);
  }
}
