import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { IAdjustmentsRepository } from './adjustments.repository.interface';
import { Adjustment } from '../entities/adjustment.entity';

@Injectable()
export class AdjustmentsRepository implements IAdjustmentsRepository {
  constructor(
    @InjectRepository(Adjustment)
    private readonly adjustmentRepository: Repository<Adjustment>,
  ) {}

  async findAll(
      page: number,
      limit: number,
      order: OrderEnum,
      batchId?: number,
  ): Promise<PaginatedResult<Adjustment>> {
    const query = this.adjustmentRepository
      .createQueryBuilder('adjustment')
      .leftJoinAndSelect('adjustment.batch', 'batch');

    if (batchId) {
      query.where('adjustment.batchId = :batchId', { batchId });
    }

    query.orderBy('adjustment.date', order);
    const offset = (page - 1) * limit;

    const [adjustments, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const paginatedResult: PaginatedResult<Adjustment> = {
      items: adjustments,
      total,
      page,
      limit,
    };
    return paginatedResult;
  }

  async findOneById(id: number): Promise<Adjustment | null> {
    return this.adjustmentRepository.findOne({
      where: { id },
      relations: { batch: true },
    });
  }

  // async create(input: CreateAdjustmentDto): Promise<Adjustment> {
  //   const adjustment = this.adjustmentRepository.create({
  //     stockChange: input.stockChange,
  //     adjustmentType: input.adjustmentType,
  //     product: { id: input.productId } as Product,
  //   });
  //   return this.adjustmentRepository.save(adjustment);
  // }

  // async update(adjustment: Adjustment): Promise<Adjustment> {
  //   return this.adjustmentRepository.save(adjustment);
  // }

  async remove(adjustment: Adjustment): Promise<Adjustment> {
    return this.adjustmentRepository.remove(adjustment);
  }
}
