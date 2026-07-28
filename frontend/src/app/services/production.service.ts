import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Production, CreateProductionRequest } from '../models/production.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private api = `${environment.apiUrl}/production`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Production[]> {
    return this.http.get<{ items: Production[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  create(production: CreateProductionRequest): Observable<Production> {
    return this.http.post<Production>(this.api, production);
  }
}
