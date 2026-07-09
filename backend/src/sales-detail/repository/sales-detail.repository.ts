import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SalesDetailRepository } from './sales-detail.repository.interface';
import { SalesDetail } from '../entities/sales-detail.entity';

@Injectable()
export class SalesDetailRepositoryImpl implements SalesDetailRepository {
  constructor(
    @InjectRepository(SalesDetail)
    private readonly detailRepository: Repository<SalesDetail>,
  ) {}

  async findAll(): Promise<SalesDetail[]> {
    return this.detailRepository.find({
      relations: { sale: true, product: true },
    });
  }

  async findBySale(saleId: number): Promise<SalesDetail[]> {
    return this.detailRepository.find({
      where: { sale: { id: saleId } as any },
      relations: { product: true },
    });
  }

  async finById(id: number): Promise<SalesDetail | null> {
    return this.detailRepository.findOne({
      where: { id },
      relations: { sale: true, product: true },
    });
  }

  async create(input: Partial<SalesDetail>): Promise<SalesDetail> {
    return this.detailRepository.save(input);
  }

  async update(detail: SalesDetail): Promise<SalesDetail> {
    return this.detailRepository.save(detail);
  }

  async remove(detail: SalesDetail): Promise<SalesDetail> {
    return this.detailRepository.remove(detail);
  }
}
