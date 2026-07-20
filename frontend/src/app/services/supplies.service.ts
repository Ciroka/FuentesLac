import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Supply } from '../models/supply.model';
import { environment } from '../../environments/environment';

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
}