import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { OneToOneInverseSideSubjectBuilder } from 'typeorm/persistence/subject-builder/OneToOneInverseSideSubjectBuilder.js';
import { Supply } from 'src/supplies';

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

  @OneToMany(() => Supply, supplies => supplies.category)
  supplies!: Supply[];
}
