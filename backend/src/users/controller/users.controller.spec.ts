import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from '../service/users.service';
import { USERS_REPOSITORY } from '../repository/users.repository.interface';
import { UserRole } from 'src/shared/enums';
import type { AuthenticatedRequest } from 'src/auth/dto/request/user-request.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { updateRole: jest.Mock };

  beforeEach(async () => {
    usersService = {
      updateRole: jest.fn().mockResolvedValue({ id: 'target-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: USERS_REPOSITORY, useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates role updates to the service with the acting admin id', async () => {
    const req = { user: { sub: 'admin-id' } } as AuthenticatedRequest;

    await controller.updateRole(req, 'target-id', { role: UserRole.ADMIN });

    expect(usersService.updateRole).toHaveBeenCalledWith(
      'admin-id',
      'target-id',
      {
        role: UserRole.ADMIN,
      },
    );
  });
});
