export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
}
