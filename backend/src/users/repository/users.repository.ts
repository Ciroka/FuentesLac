import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './users.repository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    name?: string,
  ): Promise<PaginatedResult<User>> {
    const query = this.usersRepository.createQueryBuilder('user');

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

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();
  }

  async findOneByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id })
      .getOne();
  }

  async findOneByVerificationToken(verificationToken: string) {
    return this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.verificationToken')
      .where('u.verification_token = :verificationToken', { verificationToken })
      .getOne();
  }

  async findOneByResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.codeHashResetPassword')
      .addSelect('u.resetCodePasswordExpires')
      .where('u.code_hash_reset_password = :resetPasswordToken', {
        resetPasswordToken,
      })
      .getOne();
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async register(user: DeepPartial<User>): Promise<User> {
    const userCreated = this.usersRepository.create(user);
    return this.usersRepository.save(userCreated);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.existsBy({ email });
  }

  async update(user: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(user);
  }

  async softDelete(user: User): Promise<void> {
    await this.usersRepository.softRemove(user);
  }
}
