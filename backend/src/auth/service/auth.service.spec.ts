import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/service/users.service';
import { EmailSenderService } from 'src/email-sender/service/email-sender.service';
import { RefreshToken } from '../entities/refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findOneById: jest.Mock };
  let refreshTokenRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };

  const user = {
    id: 'user-1',
    email: 'a@a.com',
    role: 'EMPLOYEE',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    usersService = { findOneById: jest.fn().mockResolvedValue(user) };
    refreshTokenRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      update: jest.fn(),
      create: jest.fn().mockImplementation((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: JwtService, useValue: { sign: () => 'signed.jwt' } },
        { provide: EmailSenderService, useValue: {} },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refresh', () => {
    it('throws when no token is provided', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when the token does not exist', async () => {
      refreshTokenRepo.findOne.mockResolvedValue(null);
      await expect(service.refresh('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('revokes every active token for the user and throws on reuse of a revoked token', async () => {
      refreshTokenRepo.findOne.mockResolvedValue({
        userId: user.id,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.refresh('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: user.id }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('throws when the token is expired', async () => {
      refreshTokenRepo.findOne.mockResolvedValue({
        userId: user.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(service.refresh('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rotates a valid token and issues a new pair', async () => {
      refreshTokenRepo.findOne.mockResolvedValue({
        userId: user.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.refresh('raw-token');

      expect(result.user.id).toBe(user.id);
      expect(result.access_token).toBe('signed.jwt');
      expect(result.refresh_token).toEqual(expect.any(String));
      expect(refreshTokenRepo.save).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('does nothing when no token is provided', async () => {
      await service.logout(undefined);
      expect(refreshTokenRepo.update).not.toHaveBeenCalled();
    });

    it('revokes the matching token', async () => {
      await service.logout('raw-token');
      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ tokenHash: expect.any(String) }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
