import { Adjustment } from 'src/adjustments/entities/adjustment.entity';
import { Category } from 'src/categories/entities/category.entity';
import { OrdersDetail } from 'src/orders-detail/entities/orders-detail.entity';
import { SalesDetail } from 'src/sales-detail/entities/sales-detail.entity';
import { Supplier } from 'src/suppliers/entities/supplier.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPrice!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  marginPercent!: number;

  @Column({ default: 0 })
  currentStock!: number;

  @Column({ default: 0 })
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
