import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { ProductionDetail } from 'src/production-detail';
import { Batch } from 'src/batch/entities/batch.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'sale_price' })
  salePrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'cost_price' })
  costPrice!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'margin_percent' })
  marginPercent!: number;

  @Column({ default: 0, name: 'min_stock' })
  minStock!: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToMany(() => Supplier, (suppliers) => suppliers.products)
  suppliers!: Supplier[];

  @OneToMany(() => Batch, (batch) => batch.product)
  batches!: Batch[];

  @OneToMany(
    () => ProductionDetail,
    (productionDetails) => productionDetails.product,
  )
  productionDetails!: ProductionDetail[];
}