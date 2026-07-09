import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Supply } from 'src/supplies';

@Entity('orders_details')
export class OrdersDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ordered_quantity', default: 0})
  orderedQuantity!: number;

  @Column({ name: 'arrival_quantity', default: 0 })
  arrivalQuantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Order, (order) => order.ordersDetails, {
    onDelete: 'RESTRICT',
  })
  order!: Order;

  @ManyToOne(() => Supply, (supply) => supply.ordersDetails)
  @JoinColumn({ name: 'supply_id' })
  supply!: Supply;
}
