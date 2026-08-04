import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Batch } from '../models/batch.model';
import { environment } from '../../environments/environment';

export interface PaginatedBatch {
  items: Batch[];
  total: number;
  page: number;
  limit: number;
}

export interface BatchQueryOptions {
  productId?: number | null;
  sortBy?: 'yield';
  order?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private api = `${environment.apiUrl}/batch`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Batch[]> {
    return this.http.get<PaginatedBatch>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findPage(page = 1, limit = 10, opts: BatchQueryOptions = {}): Observable<PaginatedBatch> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (opts.productId != null) params = params.set('productId', opts.productId);
    if (opts.sortBy) params = params.set('sortBy', opts.sortBy);
    if (opts.order) params = params.set('order', opts.order);

    return this.http.get<PaginatedBatch>(this.api, { params });
  }
}
