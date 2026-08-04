import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { UsersService } from 'src/users/service/users.service';
import type { AuthenticatedRequest } from '../dto/request/user-request.dto';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: { updatePassword: jest.Mock };
  let authService: { login: jest.Mock };
  let configGet: jest.Mock;

  const createRes = (): { cookie: jest.Mock; res: Response } => {
    const cookie = jest.fn();
    const res = { cookie, clearCookie: jest.fn() } as unknown as Response;
    return { cookie, res };
  };

  const setupModule = async (
    configValues: Record<string, unknown>,
  ): Promise<void> => {
    usersService = {
      updatePassword: jest
        .fn()
        .mockResolvedValue({ message: 'Password updated' }),
    };
    authService = {
      login: jest.fn().mockResolvedValue({
        user: { id: 'user-1' },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    };
    configGet = jest.fn((key: string) => configValues[key]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: { get: configGet } },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  };

  describe('should be defined', () => {
    beforeEach(async () => {
      await setupModule({});
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('changePassword delegates to usersService.updatePassword with the logged-in user id', async () => {
      const req = {
        user: { sub: 'user-1', email: 'a@a.com', role: 'EMPLOYEE' },
      } as AuthenticatedRequest;
      const dto = { currentPassword: 'old12345', newPassword: 'new12345' };

      const result = await controller.changePassword(req, dto);

      expect(usersService.updatePassword).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ message: 'Password updated' });
    });
  });

  describe('refresh_token cookie path', () => {
    it('uses the default "/auth" path when REFRESH_TOKEN_COOKIE_PATH is not configured', async () => {
      await setupModule({});
      const { cookie, res } = createRes();

      await controller.login(
        { email: 'a@a.com', password: 'password123' },
        res,
      );

      expect(cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({ path: '/auth' }),
      );
    });

    it('uses REFRESH_TOKEN_COOKIE_PATH when configured (e.g. behind the Vercel proxy)', async () => {
      await setupModule({ REFRESH_TOKEN_COOKIE_PATH: '/api/auth' });
      const { cookie, res } = createRes();

      await controller.login(
        { email: 'a@a.com', password: 'password123' },
        res,
      );

      expect(cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({ path: '/api/auth' }),
      );
    });
  });
});
