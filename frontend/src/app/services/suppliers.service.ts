import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../environments/environment';

export interface CreateSupplier {
  name: string;
  phone: string;
  email: string;
  address: string;
  cuit: string;
}

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

  create(supplier: CreateSupplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.api, supplier);
  }

  update(id: number, supplier: Partial<CreateSupplier>): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.api}/${id}`, supplier);
  }

  remove(id: number): Observable<Supplier> {
    return this.http.delete<Supplier>(`${this.api}/${id}`);
  }
}
