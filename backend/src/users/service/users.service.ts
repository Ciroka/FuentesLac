import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto, QueryParamsUsers } from '../dto';
import { USERS_REPOSITORY } from '../repository/users.repository.interface';
import type { IUsersRepository } from '../repository/users.repository.interface';
import { User } from '../entities/user.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async findAll(params: QueryParamsUsers): Promise<PaginatedResult<User>> {
    const { page, limit, order, name } = params;
    return this.usersRepository.findAll(page, limit, order, name);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.finById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.create(createUserDto);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.hashPassword !== undefined)
      user.hashPassword = updateUserDto.hashPassword;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;

    return this.usersRepository.update(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}
