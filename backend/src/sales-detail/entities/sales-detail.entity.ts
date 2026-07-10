import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('sales_details')
export class SalesDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Sale, (sale) => sale.details, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sale_id' })
  sale!: Sale;

  @ManyToOne(() => Product, (product) => product.salesDetails)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
