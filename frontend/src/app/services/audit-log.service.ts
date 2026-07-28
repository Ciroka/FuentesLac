import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { environment } from '../../environments/environment';

interface PaginatedAuditLog {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private api = `${environment.apiUrl}/audit-logs`;
  private readonly http = inject(HttpClient);

  findAll(page = 1, limit = 20): Observable<PaginatedAuditLog> {
    return this.http.get<PaginatedAuditLog>(`${this.api}?page=${page}&limit=${limit}`);
  }
}
