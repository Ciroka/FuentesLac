import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogService } from '../service/audit-log.service';
import { AuditAction } from 'src/shared/enums';

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let auditLogService: { record: jest.Mock };
  let jwtService: { verify: jest.Mock };

  const buildContext = (
    req: Record<string, unknown>,
    statusCode = 200,
  ): ExecutionContext => {
    const res = { statusCode };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as unknown as ExecutionContext;
  };

  const handlerReturning = (body: unknown): CallHandler => ({
    handle: () => of(body),
  });

  beforeEach(() => {
    auditLogService = { record: jest.fn().mockResolvedValue(undefined) };
    jwtService = { verify: jest.fn() };
    interceptor = new AuditLogInterceptor(
      auditLogService as unknown as AuditLogService,
      jwtService as never,
    );
  });

  it('skips GET requests entirely', () => {
    const context = buildContext({ method: 'GET', path: '/products' });
    interceptor.intercept(context, handlerReturning({})).subscribe();
    expect(auditLogService.record).not.toHaveBeenCalled();
  });

  it('ignores /auth/refresh', () => {
    const context = buildContext({ method: 'POST', path: '/auth/refresh' });
    interceptor.intercept(context, handlerReturning({})).subscribe();
    expect(auditLogService.record).not.toHaveBeenCalled();
  });

  it('records LOGIN for a successful /auth/login using the response body', () => {
    const context = buildContext({ method: 'POST', path: '/auth/login' });
    interceptor
      .intercept(
        context,
        handlerReturning({ user: { id: 'u1', email: 'a@a.com' } }),
      )
      .subscribe();

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.LOGIN,
        resource: 'auth',
        userId: 'u1',
        userEmail: 'a@a.com',
      }),
    );
  });

  it('records CREATE/UPDATE/DELETE for regular authenticated mutations', () => {
    const context = buildContext({
      method: 'PATCH',
      path: '/products/12',
      params: { id: '12' },
      user: { sub: 'u2', email: 'admin@a.com' },
    });
    interceptor.intercept(context, handlerReturning({})).subscribe();

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE,
        resource: 'products',
        resourceId: '12',
        userId: 'u2',
      }),
    );
  });

  it('does not record when the response is an error status', () => {
    const context = buildContext({ method: 'POST', path: '/products' }, 400);
    interceptor.intercept(context, handlerReturning({})).subscribe();
    expect(auditLogService.record).not.toHaveBeenCalled();
  });
});
