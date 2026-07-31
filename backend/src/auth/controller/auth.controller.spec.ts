import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { UsersService } from 'src/users/service/users.service';
import type { AuthenticatedRequest } from '../dto/request/user-request.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: { updatePassword: jest.Mock };

  beforeEach(async () => {
    usersService = {
      updatePassword: jest
        .fn()
        .mockResolvedValue({ message: 'Password updated' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
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
