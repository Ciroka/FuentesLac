import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_REPOSITORY } from '../repository/audit-log.repository.interface';
import { AuditAction } from 'src/shared/enums';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repo: { create: jest.Mock; findAll: jest.Mock };

  beforeEach(async () => {
    repo = { create: jest.fn(), findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: AUDIT_LOG_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not throw when the repository fails to save', async () => {
    repo.create.mockRejectedValue(new Error('db down'));

    await expect(
      service.record({
        userId: 'u1',
        userEmail: 'a@a.com',
        action: AuditAction.CREATE,
        resource: 'products',
        resourceId: '1',
        method: 'POST',
        path: '/products',
        statusCode: 201,
      }),
    ).resolves.toBeUndefined();
  });

  it('delegates pagination to the repository', async () => {
    repo.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    await service.findAll(1, 20);

    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
  });
});
