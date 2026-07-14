import { DeepPartial } from 'typeorm';
import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { User } from '../entities/user.entity';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface IUsersRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<User>>;
  findOneByEmail(email: string): Promise<User | null>;
  findOneById(id: string): Promise<User | null>;
  findOneByEmailWithPassword(email: string): Promise<User | null>;
  findOneByIdWithPassword(id: string): Promise<User | null>;
  findOneByVerificationToken(verificationToken: string): Promise<User | null>;
  findOneByResetPasswordToken(verificationToken: string): Promise<User | null>;
  count(): Promise<number>;
  register(user: DeepPartial<User>): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
  update(user: DeepPartial<User>): Promise<User>;
  delete(user: User): Promise<void>;
}
