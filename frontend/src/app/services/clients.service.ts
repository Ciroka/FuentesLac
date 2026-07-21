import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

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
}
