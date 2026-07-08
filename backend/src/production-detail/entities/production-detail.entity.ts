import { Production } from 'src/production/entities/production.entity';
import { Product } from 'src/products';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('production_details')
export class ProductionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @ManyToOne(() => Production, (production) => production.details)
  production!: Production;

  @ManyToOne(() => Product, (product) => product.productionDetails)
  product!: Product;
}
