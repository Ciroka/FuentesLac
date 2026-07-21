import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getStockStatus(id: number): Observable<StockStatus> {
    return this.http.get<StockStatus>(`${this.api}/${id}/stock-status`);
  }
}
