import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
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

  @ManyToOne(() => Product, (product) => product.adjustments)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
