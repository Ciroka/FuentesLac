import { OrderEnum } from '../../shared/enums/order.enum';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { CreateUserDto } from '../dto';
import { User } from '../entities/user.entity';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface IUsersRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<User>>;
  findOneById(id: number): Promise<User | null>;
  create(input: CreateUserDto): Promise<User>;
  update(user: User): Promise<User>;
  remove(user: User): Promise<User>;
}
