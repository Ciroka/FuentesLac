import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserRole } from '../../shared/enums';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'text', default: UserRole.EMPLOYEE })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ nullable: true, name: 'verification_token', type: 'varchar', select: false})
  verificationToken!: string | null;

  @Column({ nullable: true, name: 'code_hash_reset_password', type: 'varchar', select: false })
  codeHashResetPassword!: string | null;

  @Column({
    nullable: true,
    name: 'reset_code_password_expires',
    type: 'timestamptz',
    select: false
  })
  resetCodePasswordExpires!: Date | null;
}
