import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { AuditLogService } from '../service/audit-log.service';
import { AuditAction } from 'src/shared/enums';
import { Payload } from 'src/auth/types/payload.types';

const LOGGED_METHODS = new Set(['POST', 'PATCH', 'DELETE']);
const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

interface RequestUser {
  sub: string;
  email?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (!LOGGED_METHODS.has(req.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (body) => this.record(req, res, body),
      }),
    );
  }

  private record(req: Request, res: Response, body: unknown): void {
    if (res.statusCode < 200 || res.statusCode >= 300) return;

    const path = req.path ?? req.url;

    if (path.startsWith('/auth/refresh')) return;

    if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) {
      const user = (body as { user?: { id?: string; email?: string } })?.user;
      this.save(
        req,
        res,
        AuditAction.LOGIN,
        'auth',
        null,
        user?.id ?? null,
        user?.email ?? null,
      );
      return;
    }

    if (path.startsWith('/auth/logout')) {
      const { userId, userEmail } = this.identifyFromCookie(req);
      this.save(req, res, AuditAction.LOGOUT, 'auth', null, userId, userEmail);
      return;
    }

    const action = METHOD_TO_ACTION[req.method];
    if (!action) return;

    const resource = path.split('/').filter(Boolean)[0] ?? path;
    const resourceId = (req.params?.id as string | undefined) ?? null;
    const reqUser = (req as unknown as { user?: RequestUser }).user;

    this.save(
      req,
      res,
      action,
      resource,
      resourceId,
      reqUser?.sub ?? null,
      reqUser?.email ?? null,
    );
  }

  private save(
    req: Request,
    res: Response,
    action: AuditAction,
    resource: string,
    resourceId: string | null,
    userId: string | null,
    userEmail: string | null,
  ): void {
    void this.auditLogService.record({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      method: req.method,
      path: req.path ?? req.url,
      statusCode: res.statusCode,
    });
  }

  private identifyFromCookie(req: Request): {
    userId: string | null;
    userEmail: string | null;
  } {
    const token = req.cookies?.access_token as string | undefined;
    if (!token) return { userId: null, userEmail: null };

    try {
      const payload = this.jwtService.verify<Payload>(token);
      return { userId: payload.sub, userEmail: null };
    } catch {
      return { userId: null, userEmail: null };
    }
  }
}
