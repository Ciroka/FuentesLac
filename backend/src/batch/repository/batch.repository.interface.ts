import { Batch } from '../entities/batch.entity';

export const BATCH_REPOSITORY = 'BATCH_REPOSITORY';

export interface IBatchRepository {
  findAll(): Promise<Batch[]>;
  finById(id: number): Promise<Batch | null>;
  create(input: Partial<Batch>): Promise<Batch>;
  update(batch: Batch): Promise<Batch>;
  remove(batch: Batch): Promise<Batch>;
}
