import { ProductionDetail } from 'src/production-detail';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('production')
export class Production {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  productionDate!: Date;

  @OneToMany(() => ProductionDetail, (details) => details.production, { cascade: true })
  details!: ProductionDetail[];
}
