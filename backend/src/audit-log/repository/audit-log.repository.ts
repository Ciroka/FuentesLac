import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IAuditLogRepository } from './audit-log.repository.interface';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogEntry } from '../dto/create-audit-log-entry.dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async create(entry: CreateAuditLogEntry): Promise<AuditLog> {
    return this.auditLogRepo.save(this.auditLogRepo.create(entry));
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<AuditLog>> {
    const [items, total] = await this.auditLogRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }
}
