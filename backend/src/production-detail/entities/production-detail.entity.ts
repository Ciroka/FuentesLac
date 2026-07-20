import { Production } from 'src/production/entities/production.entity';
import { Product } from '../../products/entities/product.entity';
import { SuppliesXproductionDetail } from 'src/supplies-xproduction-detail/entities/supplies-xproduction-detail.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('production_details')
export class ProductionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @ManyToOne(() => Production, (production) => production.details)
  @JoinColumn({ name: 'production_id' })
  production!: Production;

  @ManyToOne(() => Product, (product) => product.productionDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(
    () => SuppliesXproductionDetail,
    (supplyXDetail) => supplyXDetail.productionDetail,
    { cascade: true },
  )
  supplyXDetail!: SuppliesXproductionDetail[];
}
