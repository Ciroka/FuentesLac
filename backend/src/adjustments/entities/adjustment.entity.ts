import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Batch } from '../../batch/entities/batch.entity';
import { AdjustmentType } from '../../shared/enums/adjustmentType.enum';

@Entity('adjustments')
export class Adjustment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'stock_change' })
  stockChange!: number;

  @Column({ type: 'enum', enum: AdjustmentType, name: 'adjustment_type' })
  adjustmentType!: AdjustmentType;

  @CreateDateColumn()
  date!: Date;

  @Column({ name: 'batch_id', nullable: true })
  batchId?: number;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch?: Batch;
}
