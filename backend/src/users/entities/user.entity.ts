import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UserRole } from '../../shared/enums';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ name: 'hash_password' })
  hashPassword!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;
}
