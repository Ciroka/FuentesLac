import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Supply } from 'src/supplies';

@Entity('suppliers')
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

  @OneToMany(() => Supply, (supplies) => supplies.supplier)
  supplies!: Supply[];
}
