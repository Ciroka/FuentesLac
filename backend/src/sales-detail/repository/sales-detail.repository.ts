import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ISalesDetailRepository } from './sales-detail.repository.interface';
import { SalesDetail } from '../entities/sales-detail.entity';
import { Sale } from 'src/sales/entities/sale.entity';

@Injectable()
export class SalesDetailRepository implements ISalesDetailRepository {
  constructor(
    @InjectRepository(SalesDetail)
    private readonly detailRepository: Repository<SalesDetail>,
  ) {}

  async findAll(): Promise<SalesDetail[]> {
    return this.detailRepository.find({
      relations: { sale: true, batch: true },
    });
  }

  async findBySale(saleId: number): Promise<SalesDetail[]> {
    return this.detailRepository.find({
      where: { sale: { id: saleId } as Sale },
      relations: { batch: true },
    });
  }

  async findOneById(id: number): Promise<SalesDetail | null> {
    return this.detailRepository.findOne({
      where: { id },
      relations: { sale: true, batch: true },
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

  async sumWeightByBatch(batchId: number): Promise<number> {
    const raw = await this.detailRepository
      .createQueryBuilder('sd')
      .select('COALESCE(SUM(sd.weight), 0)', 'total')
      .where('sd.batch_id = :batchId', { batchId })
      .getRawOne<{ total: string }>();
    return Number(raw?.total ?? 0);
  }
}