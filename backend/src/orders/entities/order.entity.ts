import { OrdersDetail } from '../../orders-detail/entities/orders-detail.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  date!: Date;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2, name: 'ordered_total' })
  orderedTotal: number = 0;
  
  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2, name: 'arrival_total' })
  arrival_total: number = 0;

  @OneToMany(() => OrdersDetail, (ordersDetails) => ordersDetails.order, { cascade: true })
  ordersDetails!: OrdersDetail[];

  @ManyToOne(() => Supplier, (supplier) => supplier.orders)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;
}
