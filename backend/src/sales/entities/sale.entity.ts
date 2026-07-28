import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Client } from '../../clients/entities/client.entity';
import { SalesDetail } from '../../sales-detail/entities/sales-detail.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  date!: Date;

  @Column({ default: 0 })
  total!: number;

  @OneToMany(() => SalesDetail, (salesDetails) => salesDetails.sale, {
    cascade: true,
  })
  details!: SalesDetail[];

  @Column({ name: 'photo_key', type: 'varchar', nullable: true })
  photoKey?: string | null;

  @Column({ name: 'client_id', nullable: true })
  clientId?: number;

  @ManyToOne(() => Client, (client) => client.sales, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Client;
}
