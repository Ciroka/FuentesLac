import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/service/users.service';
import { EmailSenderService } from 'src/email-sender/service/email-sender.service';
import { RefreshToken } from '../entities/refresh-token.entity';

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findOneById: jest.Mock;
    findOneByEmail: jest.Mock;
    findOneByResetPasswordToken: jest.Mock;
    save: jest.Mock;
  };
  let emailSenderService: { sendResetCode: jest.Mock };
  let refreshTokenRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };

  const user = {
    id: 'user-1',
    name: 'Ana',
    email: 'a@a.com',
    role: 'EMPLOYEE',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findOneById: jest.fn().mockResolvedValue(user),
      findOneByEmail: jest.fn().mockResolvedValue(user),
      findOneByResetPasswordToken: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };
    emailSenderService = {
      sendResetCode: jest.fn().mockResolvedValue(undefined),
    };
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
        { provide: EmailSenderService, useValue: emailSenderService },
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

  describe('me', () => {
    it('returns the profile including the name', async () => {
      const result = await service.me(user.id);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    });
  });

  describe('forgotPassword', () => {
    it('hashes the code deterministically (sha256) so it can later be looked up by hash', async () => {
      await service.forgotPassword('a@a.com');

      expect(emailSenderService.sendResetCode).toHaveBeenCalledWith(
        'a@a.com',
        expect.stringMatching(/^\d{6}$/),
      );
      const [sentEmail, sentCode] =
        emailSenderService.sendResetCode.mock.calls[0];
      expect(sentEmail).toBe('a@a.com');

      const savedUser = usersService.save.mock.calls[0][0];
      // sha256 of the emailed code must match what got stored, since
      // resetPassword looks the user up by re-hashing the submitted code.
      expect(savedUser.codeHashResetPassword).toBe(sha256(sentCode as string));
    });

    it('returns the same generic message when the email does not exist (no enumeration)', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      const result = await service.forgotPassword('nobody@a.com');
      expect(result.message).toBe('Si el email existe, recibirás un link');
      expect(emailSenderService.sendResetCode).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('rejects when no user matches the hashed token', async () => {
      usersService.findOneByResetPasswordToken.mockResolvedValue(null);
      await expect(
        service.resetPassword('123456', 'newpassword1'),
      ).rejects.toThrow('Token inválido o expirado');
    });

    it('rejects an expired code', async () => {
      usersService.findOneByResetPasswordToken.mockResolvedValue({
        ...user,
        resetCodePasswordExpires: new Date(Date.now() - 1000),
      });
      await expect(
        service.resetPassword('123456', 'newpassword1'),
      ).rejects.toThrow('Token inválido o expirado');
    });

    it('accepts a valid code, looking the user up by the sha256 hash of the submitted code', async () => {
      usersService.findOneByResetPasswordToken.mockResolvedValue({
        ...user,
        resetCodePasswordExpires: new Date(Date.now() + 60_000),
      });

      const result = await service.resetPassword('123456', 'newpassword1');

      expect(usersService.findOneByResetPasswordToken).toHaveBeenCalledWith(
        sha256('123456'),
      );
      expect(result.message).toBe('Contraseña actualizada');
      const savedUser = usersService.save.mock.calls[0][0];
      expect(savedUser.codeHashResetPassword).toBeNull();
      expect(savedUser.resetCodePasswordExpires).toBeNull();
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
