import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Sale } from '../../sales/entities/sale.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column()
  phone!: string;

  @Column()
  cuit!: string;

  @Column()
  email!: string;

  @OneToMany(() => Sale, (sales) => sales.client)
  sales!: Sale[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
