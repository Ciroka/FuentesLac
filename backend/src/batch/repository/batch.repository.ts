import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IBatchRepository } from './batch.repository.interface';
import { Batch } from '../entities/batch.entity';

@Injectable()
export class BatchRepository implements IBatchRepository {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async findAll(): Promise<Batch[]> {
    return this.batchRepository.find();
  }

  async findOneById(id: number): Promise<Batch | null> {
    return this.batchRepository.findOneBy({ id });
  }

  async create(input: Partial<Batch>): Promise<Batch> {
    return this.batchRepository.save(input);
  }

  async update(batch: Partial<Batch>): Promise<Batch> {
    return this.batchRepository.save(batch);
  }

  async remove(batch: Batch): Promise<Batch> {
    return this.batchRepository.remove(batch);
  }
}
