import { AuditAction } from 'src/shared/enums';

export interface CreateAuditLogEntry {
  userId: string | null;
  userEmail: string | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  method: string;
  path: string;
  statusCode: number;
}
