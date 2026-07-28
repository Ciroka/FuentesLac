import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private api = `${environment.apiUrl}/suppliers`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Supplier[]> {
    return this.http.get<{ items: Supplier[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }
}
