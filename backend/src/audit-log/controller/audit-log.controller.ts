import { Controller, Get, Query } from '@nestjs/common';

import { AuditLogService } from '../service/audit-log.service';
import { QueryParamsAuditLog } from '../dto';
import { AuditLog } from '../entities/audit-log.entity';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('audit-logs')
@Roles(UserRole.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsAuditLog,
  ): Promise<PaginatedResult<AuditLog>> {
    return this.auditLogService.findAll(params.page, params.limit);
  }
}
