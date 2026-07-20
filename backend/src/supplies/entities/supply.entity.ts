import { Category } from '../../categories/entities/category.entity';
import { OrdersDetail } from '../../orders-detail/entities/orders-detail.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { SuppliesXproductionDetail } from 'src/supplies-xproduction-detail/entities/supplies-xproduction-detail.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('supplies')
export class Supply {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'decimal', scale: 2, precision: 10, name: 'cost_price' })
  costPrice!: number;

  @Column({ default: 0, name: 'current_stock' })
  currentStock!: number;

  @Column({ default: 0, name: 'min_stock' })
  minStock!: number;

  @Column({ name: 'is_milk', type: 'boolean', default: false })
  isMilk!: boolean;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId?: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.supplies)
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: number;

  @ManyToOne(() => Category, (category) => category.supplies, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(
    () => SuppliesXproductionDetail,
    (supplyXDetail) => supplyXDetail.supply,
  )
  supplyXDetail!: SuppliesXproductionDetail[];

  @OneToMany(() => OrdersDetail, (ordersDetails) => ordersDetails.supply)
  ordersDetails!: OrdersDetail[];
}
