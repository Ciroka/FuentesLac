import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuditLogController } from './controller/audit-log.controller';
import { AuditLogService } from './service/audit-log.service';
import { AuditLog } from './entities/audit-log.entity';
import { AUDIT_LOG_REPOSITORY } from './repository/audit-log.repository.interface';
import { AuditLogRepository } from './repository/audit-log.repository';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { AuthModule } from 'src/auth';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), AuthModule],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogRepository },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
  exports: [TypeOrmModule],
})
export class AuditLogModule {}
