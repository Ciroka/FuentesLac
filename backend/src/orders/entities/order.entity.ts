import { OrdersDetail } from '../../orders-detail/entities/orders-detail.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { OrderStatus } from '../../shared/enums/orderStatus.enum';
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

  @Column({
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'ordered_total',
  })
  orderedTotal: number = 0;

  @Column({
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'arrival_total',
  })
  arrivalTotal: number = 0;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus = OrderStatus.PENDING;

  @OneToMany(() => OrdersDetail, (ordersDetails) => ordersDetails.order, {
    cascade: true,
  })
  ordersDetails!: OrdersDetail[];

  @Column({ name: 'supplier_id', nullable: true })
  supplierId?: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.orders)
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;
}
