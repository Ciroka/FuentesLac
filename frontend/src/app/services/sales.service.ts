import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Sale, CreateSaleRequest } from '../models/sale.model';
import { environment } from '../../environments/environment';

interface PaginatedSales {
  items: Sale[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private api = `${environment.apiUrl}/sales`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Sale[]> {
    return this.http.get<{ items: Sale[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findPage(page = 1, limit = 10): Observable<PaginatedSales> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedSales>(this.api, { params });
  }

  create(sale: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.api, sale);
  }

  /** Sube (o reemplaza) la única foto de la venta. */
  uploadPhoto(saleId: number, file: File): Observable<Sale> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Sale>(`${this.api}/${saleId}/photo`, formData);
  }

  removePhoto(saleId: number): Observable<Sale> {
    return this.http.delete<Sale>(`${this.api}/${saleId}/photo`);
  }
}
