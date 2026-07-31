import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { USERS_REPOSITORY } from '../repository/users.repository.interface';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: {
    findOneByIdWithPassword: jest.Mock;
    existsByEmail: jest.Mock;
    update: jest.Mock;
    findOneById: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    usersRepository = {
      findOneByIdWithPassword: jest.fn(),
      existsByEmail: jest.fn(),
      update: jest.fn((user: Partial<User>) => Promise.resolve(user)),
      findOneById: jest.fn(),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateEmail', () => {
    const existingUser = {
      id: 'user-1',
      email: 'old@mail.com',
      passwordHash: 'hash',
    } as User;

    it('normalizes the new email and rejects if it collides with another account', async () => {
      usersRepository.findOneByIdWithPassword.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        service.updateEmail('user-1', {
          password: 'pass',
          newEmail: '  New@Mail.com  ',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersRepository.existsByEmail).toHaveBeenCalledWith(
        'new@mail.com',
      );
      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    it('normalizes and saves the new email when it is free', async () => {
      usersRepository.findOneByIdWithPassword.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.existsByEmail.mockResolvedValue(false);

      await service.updateEmail('user-1', {
        password: 'pass',
        newEmail: '  New@Mail.com  ',
      });

      expect(usersRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@mail.com' }),
      );
    });

    it('throws if the current password does not match', async () => {
      usersRepository.findOneByIdWithPassword.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateEmail('user-1', {
          password: 'wrong',
          newEmail: 'new@mail.com',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('refuses to let a user delete their own account', async () => {
      await expect(service.remove('admin-1', 'admin-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(usersRepository.softDelete).not.toHaveBeenCalled();
    });

    it('soft-deletes another user', async () => {
      const target = { id: 'user-2' } as User;
      usersRepository.findOneById.mockResolvedValue(target);

      await service.remove('admin-1', 'user-2');

      expect(usersRepository.softDelete).toHaveBeenCalledWith(target);
    });
  });
});
