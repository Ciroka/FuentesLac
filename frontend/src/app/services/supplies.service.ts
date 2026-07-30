import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Supply } from '../models/supply.model';
import { environment } from '../../environments/environment';

export interface CreateSupply {
  name: string;
  costPrice: number;
  isMilk?: boolean;
  currentStock?: number;
  minStock: number;
  supplierId?: number;
  categoryId?: number;
}

interface PaginatedSupplies {
  items: Supply[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class SuppliesService {
  private api = `${environment.apiUrl}/supplies`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Supply[]> {
    return this.http.get<{ items: Supply[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findPage(page = 1, limit = 10, name?: string, categoryId?: number | null): Observable<PaginatedSupplies> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (name) params = params.set('name', name);
    if (categoryId != null) params = params.set('categoryId', categoryId);

    return this.http.get<PaginatedSupplies>(this.api, { params });
  }

  create(supply: CreateSupply): Observable<Supply> {
    return this.http.post<Supply>(this.api, supply);
  }
}