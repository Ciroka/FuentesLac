import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Sale } from '../models/sale.model';
import { environment } from '../../environments/environment';

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
}
