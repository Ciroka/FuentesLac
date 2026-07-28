import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AuditAction } from 'src/shared/enums';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', name: 'user_email', nullable: true })
  userEmail!: string | null;

  @Column({ type: 'text' })
  action!: AuditAction;

  @Column()
  resource!: string;

  @Column({ type: 'varchar', name: 'resource_id', nullable: true })
  resourceId!: string | null;

  @Column()
  method!: string;

  @Column()
  path!: string;

  @Column({ name: 'status_code' })
  statusCode!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
