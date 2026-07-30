import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Production, CreateProductionRequest } from '../models/production.model';
import { environment } from '../../environments/environment';

interface PaginatedProduction {
  items: Production[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private api = `${environment.apiUrl}/production`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Production[]> {
    return this.http.get<{ items: Production[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findPage(page = 1, limit = 10): Observable<PaginatedProduction> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedProduction>(this.api, { params });
  }

  create(production: CreateProductionRequest): Observable<Production> {
    return this.http.post<Production>(this.api, production);
  }
}
