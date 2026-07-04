import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @Column()
  email!: string;

  @Column()
  address!: string;

  @Column()
  cuit!: string;

  @ManyToMany(() => Product, (products) => products.suppliers)
  @JoinTable()
  products!: Product[];

  @OneToMany(() => Order, (orders) => orders.supplier)
  orders!: Order[];
}
