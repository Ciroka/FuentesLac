import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Supply } from '../../supplies/entities/supply.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Product, (products) => products.category)
  products!: Product[];

  @OneToMany(() => Supply, (supplies) => supplies.category)
  supplies!: Supply[];
}
