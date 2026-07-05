import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Adjustment } from '../../adjustments/entities/adjustment.entity';
import { Category } from '../../categories/entities/category.entity';
import { OrdersDetail } from '../../orders-detail/entities/orders-detail.entity';
import { SalesDetail } from '../../sales-detail/entities/sales-detail.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

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

  @Column({ default: 0, name: 'current_stock' })
  currentStock!: number;

  @Column({ default: 0, name: 'min_stock' })
  minStock!: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: number;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToMany(() => Supplier, (suppliers) => suppliers.products)
  suppliers!: Supplier[];

  @OneToMany(() => SalesDetail, (salesDetails) => salesDetails.product)
  salesDetails!: SalesDetail[];

  @OneToMany(() => OrdersDetail, (ordersDetails) => ordersDetails.product)
  ordersDetails!: OrdersDetail[];

  @OneToMany(() => Adjustment, (adjustments) => adjustments.product)
  adjustments!: Adjustment[];
}
