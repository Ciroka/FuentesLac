import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Supply } from '../models/supply.model';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

export interface DashboardData {
  insumos: Supply[];
  productos: Product[];
  insumosBajoMinimo: number;
  gastoInsumos: number;
  totalProductos: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private suppliesApi = `${environment.apiUrl}/supplies`;
  private productsApi = `${environment.apiUrl}/products`;

  loadDashboard(): Observable<DashboardData> {
    return forkJoin({
      insumos: this.http.get<{ items: Supply[] }>(`${this.suppliesApi}?limit=1000`).pipe(
        map(res => res.items)
      ),
      productos: this.http.get<{ items: Product[] }>(`${this.productsApi}?limit=1000`).pipe(
        map(res => res.items)
      ),
    }).pipe(
      map(({ insumos, productos }) => {
        const insumosBajoMinimo = insumos.filter(i => i.currentStock < i.minStock).length;
        const gastoInsumos = insumos.reduce((acc, i) => acc + (i.costPrice * i.currentStock), 0);
        return {
          insumos,
          productos,
          insumosBajoMinimo,
          gastoInsumos,
          totalProductos: productos.length,
        };
      })
    );
  }
}
