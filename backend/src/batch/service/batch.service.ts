import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import type { IBatchRepository } from '../repository/batch.repository.interface';
import { Batch } from '../entities/batch.entity';
import { SalesDetailService } from 'src/sales-detail/service/sales-detail.service';

@Injectable()
export class BatchService {
  constructor(
    @Inject(BATCH_REPOSITORY)
    private readonly batchRepository: IBatchRepository,
    private readonly salesDetailService: SalesDetailService,
  ) {}

  async findAll(): Promise<Batch[]> {
    return await this.batchRepository.findAll();
  }

  async findOne(id: number, manager?: EntityManager): Promise<Batch> {
    const batch = await this.batchRepository.findOneById(id, manager);
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(input: Partial<Batch>, manager?: EntityManager): Promise<Batch> {
    return this.batchRepository.create(input, manager);
  }

  async decreaseStock(
    id: number,
    stock: number,
    manager?: EntityManager,
  ): Promise<Batch> {
    const batch = await this.findOne(id, manager);
    const updated = await this.batchRepository.decreaseStockAtomic(
      id,
      stock,
      manager,
    );
    if (!updated || updated.currentStock >= batch.currentStock) {
      throw new BadRequestException('Insufficient current stock');
    }
    return updated;
  }

  async increaseStock(
    id: number,
    stock: number,
    manager?: EntityManager,
  ): Promise<Batch> {
    const batch = await this.findOne(id, manager);
    const updated = await this.batchRepository.increaseStockAtomic(
      id,
      stock,
      manager,
    );
    if (!updated || updated.currentStock < batch.currentStock) {
      throw new BadRequestException('Stock could not update');
    }
    return updated;
  }

  async addSoldWeight(
    batchId: number,
    weight: number,
    manager?: EntityManager,
  ): Promise<Batch> {
    const batch = await this.findOne(batchId, manager);
    batch.obtainedWeight = (batch.obtainedWeight ?? 0) + weight;
    if (batch.milkLitersUsed) {
      batch.yield = batch.obtainedWeight / batch.milkLitersUsed;
    }
    return this.batchRepository.update(batch, manager);
  }

  async recalculateYield(batchId: number): Promise<Batch> {
    const batch = await this.findOne(batchId);
    const totalWeight = await this.salesDetailService.sumWeightByBatch(batchId);
    batch.obtainedWeight = totalWeight;
    batch.yield = batch.milkLitersUsed
      ? totalWeight / batch.milkLitersUsed
      : undefined;
    return this.batchRepository.update(batch);
  }

  async subtractSoldWeight(
    batchId: number,
    weight: number,
    manager?: EntityManager,
  ): Promise<Batch> {
    const batch = await this.findOne(batchId, manager);
    batch.obtainedWeight = Math.max((batch.obtainedWeight ?? 0) - weight, 0);
    if (batch.milkLitersUsed) {
      batch.yield = batch.milkLitersUsed
        ? batch.obtainedWeight / batch.milkLitersUsed
        : undefined;
    }
    return this.batchRepository.update(batch, manager);
  }

  async getTotalStockByProduct(productId: number): Promise<number> {
    return this.batchRepository.sumStockByProductId(productId);
  }

  async remove(id: number): Promise<Batch> {
    const batch = await this.findOne(id);
    return this.batchRepository.remove(batch);
  }
}
