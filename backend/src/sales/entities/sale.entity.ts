import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentMethod } from '../../shared/enums/paymentMethod..enum';
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

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod!: PaymentMethod;

  @OneToMany(() => SalesDetail, (salesDetails) => salesDetails.sale)
  details!: SalesDetail[];

  @ManyToOne(() => Client, (client) => client.sales, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client!: Client;
}
