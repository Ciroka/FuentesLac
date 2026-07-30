import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthUser, UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

interface PaginatedUsers {
  items: AuthUser[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<AuthUser[]> {
    return this.http
      .get<{ items: AuthUser[] }>(`${this.api}?limit=${limit}`)
      .pipe(map(res => res.items));
  }

  findPage(page = 1, limit = 10, name?: string): Observable<PaginatedUsers> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (name) params = params.set('name', name);
    return this.http.get<PaginatedUsers>(this.api, { params });
  }

  updateRole(id: string, role: UserRole): Observable<AuthUser> {
    return this.http.patch<AuthUser>(`${this.api}/${id}/role`, { role });
  }

  remove(id: string): Observable<AuthUser> {
    return this.http.delete<AuthUser>(`${this.api}/${id}`);
  }
}
