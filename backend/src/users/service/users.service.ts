import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  QueryParamsUsers,
  UpdateUserRoleDto,
  UserChangeEmailDto,
} from '../dto';
import { USERS_REPOSITORY } from '../repository/users.repository.interface';
import type { IUsersRepository } from '../repository/users.repository.interface';
import { User } from '../entities/user.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DeepPartial } from 'typeorm';
import { UserMessageResponse } from 'src/auth/dto/response/user-message-response.dto';
import { UserChangePasswordDto } from '../dto/request/user-change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async findAll(params: QueryParamsUsers): Promise<PaginatedResult<User>> {
    const { page, limit, order, name } = params;
    return this.usersRepository.findAll(page, limit, order, name);
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneByEmail(email.trim().toLowerCase());
  }

  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOneByEmailWithPassword(
      email.trim().toLowerCase(),
    );
  }

  async findOneByVerificationToken(
    verificationToken: string,
  ): Promise<User | null> {
    return this.usersRepository.findOneByVerificationToken(verificationToken);
  }

  async findOneByResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<User | null> {
    return this.usersRepository.findOneByResetPasswordToken(resetPasswordToken);
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async register(user: DeepPartial<User>): Promise<User> {
    return this.usersRepository.register(user);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.existsByEmail(email.trim().toLowerCase());
  }

  async updateRole(
    adminId: string,
    id: string,
    dto: UpdateUserRoleDto,
  ): Promise<User> {
    if (adminId === id)
      throw new ForbiddenException('No se puede cambiar rol propio.');
    const user = await this.findOneById(id);
    user.role = dto.role;
    return this.usersRepository.update(user);
  }

  async updatePassword(
    id: string,
    dto: UserChangePasswordDto,
  ): Promise<UserMessageResponse> {
    const user = await this.usersRepository.findOneByIdWithPassword(id);

    if (
      !user ||
      !(await bcrypt.compare(dto.currentPassword, user.passwordHash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const rounds = Number(
      this.configService.get<string>('BCRYPT_COST') ?? '12',
    );
    const passwordHash = await bcrypt.hash(dto.newPassword, rounds);

    user.passwordHash = passwordHash;
    await this.usersRepository.update(user);

    return { message: 'Password updated' };
  }

  async updateEmail(
    id: string,
    dto: UserChangeEmailDto,
  ): Promise<UserMessageResponse> {
    const user = await this.usersRepository.findOneByIdWithPassword(id);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.email = dto.newEmail;
    await this.usersRepository.update(user);

    return { message: 'Email updated' };
  }

  async resetPassword(user: User): Promise<void> {
    user.verificationToken = null;
    await this.usersRepository.update(user);
  }

  async save(user: DeepPartial<User>): Promise<void> {
    await this.usersRepository.update(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id);
    await this.usersRepository.softDelete(user);
    return user;
  }
}
