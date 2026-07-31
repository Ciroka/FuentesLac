import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdjustmentDto, QueryParamsAdjustments } from '../dto';
import { ADJUSTMENTS_REPOSITORY } from '../repository/adjustments.repository.interface';
import type { IAdjustmentsRepository } from '../repository/adjustments.repository.interface';
import { Adjustment } from '../entities/adjustment.entity';
import { BatchService } from 'src/batch/service/batch.service';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { DataSource } from 'typeorm';
import { Batch } from 'src/batch/entities/batch.entity';
import { AdjustmentType } from 'src/shared/enums/adjustmentType.enum';

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
      const amount = Math.abs(createAdjustmentDto.stockChange);
      const isIncrease =
        createAdjustmentDto.adjustmentType === AdjustmentType.ADJUST &&
        createAdjustmentDto.stockChange > 0;

      if (isIncrease) {
        await this.batchService.increaseStock(batchId, amount, manager);
      } else {
        await this.batchService.decreaseStock(batchId, amount, manager);
      }

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

      const amount = Math.abs(adjustment.stockChange);
      const wasIncrease =
        adjustment.adjustmentType === AdjustmentType.ADJUST &&
        adjustment.stockChange > 0;

      if (wasIncrease) {
        await this.batchService.decreaseStock(
          adjustment.batchId!,
          amount,
          manager,
        );
      } else {
        await this.batchService.increaseStock(
          adjustment.batchId!,
          amount,
          manager,
        );
      }

      return adjustmentRepo.remove(adjustment);
    });
  }
}
