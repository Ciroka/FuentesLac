import { ProductionDetail } from '../../production-detail/entities/production-detail.entity';
import { Supply } from '../../supplies/entities/supply.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('supplies_x_production_detail')
export class SuppliesXproductionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @ManyToOne(() => Supply, (supply) => supply.supplyXDetail)
  @JoinColumn({ name: 'supply_id' })
  supply!: Supply;

  @ManyToOne(
    () => ProductionDetail,
    (productionDetail) => productionDetail.supplyXDetail,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'production_detail_id' })
  productionDetail!: ProductionDetail;
}
