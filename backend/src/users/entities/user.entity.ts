import { UserRole } from 'src/shared/enums/userRole.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  hashPassword!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;
}
