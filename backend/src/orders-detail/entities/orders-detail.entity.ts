import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('orders_details')
export class OrdersDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Order, (order) => order.ordersDetails, { onDelete: 'RESTRICT' })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.ordersDetails)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
