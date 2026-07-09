import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBatchDto } from '../dto';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import type { IBatchRepository } from '../repository/batch.repository.interface';
import { Batch } from '../entities/batch.entity';

@Injectable()
export class BatchService {
  constructor(
    @Inject(BATCH_REPOSITORY)
    private readonly batchRepository: IBatchRepository,
  ) {}

  async findAll() {
    return this.batchRepository.findAll();
  }

  async findOne(id: number): Promise<Batch> {
    const batch = await this.batchRepository.finById(id);
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    return this.batchRepository.create(createBatchDto);
  }

  // async update(id: number, updateBatchDto: UpdateBatchDto) {
  //   const batch = await this.findOne(id);

  //   if (updateBatchDto.yield !== undefined) batch.yield = updateBatchDto.yield;
  //   if (updateBatchDto.description !== undefined) batch.description = updateBatchDto.description;

  //   return this.batchRepository.update(batch);
  // } no creo que se tenga que actualizar un lote, si es que se hace todo de una si no si

  async remove(id: number): Promise<Batch> {
    const batch = await this.findOne(id);
    return this.batchRepository.remove(batch);
  }
}
