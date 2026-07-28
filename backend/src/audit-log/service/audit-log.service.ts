import { Inject, Injectable, Logger } from '@nestjs/common';

import { AUDIT_LOG_REPOSITORY } from '../repository/audit-log.repository.interface';
import type { IAuditLogRepository } from '../repository/audit-log.repository.interface';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogEntry } from '../dto/create-audit-log-entry.dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async record(entry: CreateAuditLogEntry): Promise<void> {
    try {
      await this.auditLogRepository.create(entry);
    } catch (error) {
      this.logger.error('Failed to record audit log entry', error);
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<AuditLog>> {
    return this.auditLogRepository.findAll(page, limit);
  }
}
