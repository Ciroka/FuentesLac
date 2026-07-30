import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, switchMap } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

interface StockStatus {
  productId: number;
  productName: string;
  minStock: number;
  totalStock: number;
  isLowStock: boolean;
}

interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProduct {
  name: string;
  salePrice?: number;
  costPrice: number;
  marginPercent?: number;
  minStock: number;
  categoryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private api = `${environment.apiUrl}/products`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Product[]> {
    return this.http.get<{ items: Product[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findAllWithStock(limit = 1000): Observable<Product[]> {
    return this.findAll(limit).pipe(
      switchMap(products => {
        if (products.length === 0) return of([] as Product[]);

        const requests = products.map(p =>
          this.http.get<StockStatus>(`${this.api}/${p.id}/stock-status`).pipe(
            map(status => ({
              ...p,
              totalStock: status.totalStock,
              isLowStock: status.isLowStock,
            } as Product)),
            catchError(() => of({ ...p, totalStock: 0, isLowStock: true } as Product))
          )
        );

        return forkJoin(requests);
      })
    );
  }

  findPageWithStock(
    page = 1,
    limit = 10,
    name?: string,
    categoryId?: number | null,
  ): Observable<PaginatedProducts> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (name) params = params.set('name', name);
    if (categoryId != null) params = params.set('categoryId', categoryId);

    return this.http.get<PaginatedProducts>(this.api, { params }).pipe(
      switchMap(res => {
        if (res.items.length === 0) return of(res);

        const requests = res.items.map(p =>
          this.http.get<StockStatus>(`${this.api}/${p.id}/stock-status`).pipe(
            map(status => ({
              ...p,
              totalStock: status.totalStock,
              isLowStock: status.isLowStock,
            } as Product)),
            catchError(() => of({ ...p, totalStock: 0, isLowStock: true } as Product))
          )
        );

        return forkJoin(requests).pipe(map(items => ({ ...res, items })));
      })
    );
  }

  getStockStatus(id: number): Observable<StockStatus> {
    return this.http.get<StockStatus>(`${this.api}/${id}/stock-status`);
  }

  create(product: CreateProduct): Observable<Product> {
    return this.http.post<Product>(this.api, product);
  }
}
