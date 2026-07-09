import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Supply } from 'src/supplies';

@Entity('orders_details')
export class OrdersDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ordered_quantity', default: 0 })
  orderedQuantity: number = 0;

  @Column({ name: 'arrival_quantity', default: 0 })
  arrivalQuantity: number = 0;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'ordered_subtotal',
    default: 0,
  })
  orderedSubtotal: number = 0;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'arrival_subtotal',
    default: 0,
  })
  arrivalSubtotal: number = 0;

  @ManyToOne(() => Order, (order) => order.ordersDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => Supply, (supply) => supply.ordersDetails)
  @JoinColumn({ name: 'supply_id' })
  supply!: Supply;
}
