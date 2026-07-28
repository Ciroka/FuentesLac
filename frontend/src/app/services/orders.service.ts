import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private api = `${environment.apiUrl}/orders`;
  private readonly http = inject(HttpClient);

  create(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.api, order);
  }
}
