import { Product } from '../../products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('batch')
export class Batch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  yield?: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true, name: 'milk_liters_used' })
  milkLitersUsed?: number;

  @Column({ nullable: true, name: 'obtained_weight' })
  obtainedWeight?: number;

  @Column({ type: 'date', name: 'client_batch_date', nullable: true })
  clientBatchDate?: Date;

  @Column({ default: 0, name: 'current_stock' })
  currentStock!: number;

  @Column({ name: 'product_id' })
  productId!: number;

  @ManyToOne(() => Product, (product) => product.batches)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
