import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { CreateUserDto } from '../dto';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './users.repository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<User>> {
    const query = this.userRepository.createQueryBuilder('user');

    if (name) {
      query.where('user.name ILIKE :name', { name: `%${name}%` });
    }

    query.orderBy('user.name', order);
    const offset = (page - 1) * limit;

    const [users, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const paginatedResult: PaginatedResult<User> = {
      items: users,
      total,
      page,
      limit,
    };

    return paginatedResult;
  }

  async finById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(input: CreateUserDto): Promise<User> {
    return this.userRepository.save(input);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async remove(user: User): Promise<User> {
    return this.userRepository.remove(user);
  }
}
