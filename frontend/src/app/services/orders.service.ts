import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order, CreateOrderRequest, RegisterArrivalRequest } from '../models/order.model';
import { environment } from '../../environments/environment';

interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private api = `${environment.apiUrl}/orders`;
  private readonly http = inject(HttpClient);

  /** El backend ordena ASC por defecto, por eso el order=DESC explícito. */
  findAll(limit = 1000): Observable<Order[]> {
    return this.http.get<{ items: Order[] }>(`${this.api}?limit=${limit}&order=DESC`).pipe(
      map(res => res.items.map(order => this.toNumbers(order)))
    );
  }

  findPage(page = 1, limit = 10): Observable<PaginatedOrders> {
    const params = new HttpParams().set('page', page).set('limit', limit).set('order', 'DESC');
    return this.http.get<PaginatedOrders>(this.api, { params }).pipe(
      map(res => ({ ...res, items: res.items.map(order => this.toNumbers(order)) }))
    );
  }

  create(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.api, order);
  }

  registerArrival(id: number, body: RegisterArrivalRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.api}/${id}/arrival`, body).pipe(
      map(order => this.toNumbers(order))
    );
  }

  cancel(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.api}/${id}/cancel`, {}).pipe(
      map(order => this.toNumbers(order))
    );
  }

  /**
   * Las columnas decimal de Postgres llegan como string ("142500.00") y el
   * pipe currency no las formatea.
   */
  private toNumbers(order: Order): Order {
    return {
      ...order,
      orderedTotal: Number(order.orderedTotal),
      arrivalTotal: Number(order.arrivalTotal),
      ordersDetails: (order.ordersDetails ?? []).map(detail => ({
        ...detail,
        unitPrice: Number(detail.unitPrice),
        orderedSubtotal: Number(detail.orderedSubtotal),
        arrivalSubtotal: Number(detail.arrivalSubtotal),
      })),
    };
  }
}
