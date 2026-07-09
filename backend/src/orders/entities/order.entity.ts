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

  @Column({ default: 0 })
  total!: number;

  @OneToMany(() => OrdersDetail, (ordersDetails) => ordersDetails.order)
  ordersDetails!: OrdersDetail[];

  @ManyToOne(() => Supplier, (supplier) => supplier.orders)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;
}
