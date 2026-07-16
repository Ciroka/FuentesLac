import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdjustmentDto, QueryParamsAdjustments } from '../dto';
import { ADJUSTMENTS_REPOSITORY } from '../repository/adjustments.repository.interface';
import type { IAdjustmentsRepository } from '../repository/adjustments.repository.interface';
import { Adjustment } from '../entities/adjustment.entity';
import { BatchService } from 'src/batch/service/batch.service';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { DataSource } from 'typeorm';
import { Batch } from 'src/batch/entities/batch.entity';

@Injectable()
export class AdjustmentsService {
  constructor(
    @Inject(ADJUSTMENTS_REPOSITORY)
    private readonly adjustmentsRepository: IAdjustmentsRepository,
    private readonly batchService: BatchService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    params: QueryParamsAdjustments,
  ): Promise<PaginatedResult<Adjustment>> {
    const { page, limit, order, batchId } = params;
    return this.adjustmentsRepository.findAll(page, limit, order, batchId);
  }

  async findOneById(id: number): Promise<Adjustment> {
    const adjustment = await this.adjustmentsRepository.findOneById(id);
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return adjustment;
  }

  async create(
    batchId: number,
    createAdjustmentDto: CreateAdjustmentDto,
  ): Promise<Adjustment> {
    return this.dataSource.transaction(async (manager) => {
      const adjustmentRepo = manager.getRepository(Adjustment);

      await this.batchService.decreaseStock(
        batchId,
        createAdjustmentDto.stockChange,
        manager,
      );

      const adjustment = await adjustmentRepo.save(
        adjustmentRepo.create({
          stockChange: createAdjustmentDto.stockChange,
          adjustmentType: createAdjustmentDto.adjustmentType,
          batch: { id: batchId } as Batch,
        }),
      );
      return adjustment;
    });
  }

  async remove(id: number): Promise<Adjustment> {
    return this.dataSource.transaction(async (manager) => {
      const adjustmentRepo = manager.getRepository(Adjustment);
      const adjustment = await adjustmentRepo.findOne({
        where: { id },
        relations: { batch: true },
      });
      if (!adjustment) throw new NotFoundException('Adjustment not found');

      await this.batchService.increaseStock(
        adjustment.batchId!,
        adjustment.stockChange,
        manager,
      );

      return adjustmentRepo.remove(adjustment);
    });
  }
}
