import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Client, CreateClientRequest } from '../models/client.model';
import { environment } from '../../environments/environment';

interface PaginatedClients {
  items: Client[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private api = `${environment.apiUrl}/clients`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Client[]> {
    return this.http.get<{ items: Client[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findPage(page = 1, limit = 10, name?: string): Observable<PaginatedClients> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (name) params = params.set('name', name);
    return this.http.get<PaginatedClients>(this.api, { params });
  }

  create(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.api, client);
  }
}
