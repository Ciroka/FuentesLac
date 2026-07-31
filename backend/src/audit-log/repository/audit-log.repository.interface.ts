import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogEntry } from '../dto/create-audit-log-entry.dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

export const AUDIT_LOG_REPOSITORY = 'AUDIT_LOG_REPOSITORY';

export interface IAuditLogRepository {
  create(entry: CreateAuditLogEntry): Promise<AuditLog>;
  findAll(page: number, limit: number): Promise<PaginatedResult<AuditLog>>;
}
