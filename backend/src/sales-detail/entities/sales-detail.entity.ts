import { Product } from 'src/products/entities/product.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SalesDetail {
  @PrimaryGeneratedColumn()
  salesDetailId!: number;

  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Sale, (sale) => sale.salesDetails)
  sale!: Sale;

  @ManyToOne(() => Product, (product) => product.salesDetails)
  product!: Product;
}
