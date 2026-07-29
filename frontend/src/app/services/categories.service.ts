import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

export interface CreateCategory {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private api = `${environment.apiUrl}/categories`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Category[]> {
    return this.http
      .get<{ items: Category[] }>(`${this.api}?limit=${limit}`)
      .pipe(map(res => res.items));
  }

  create(category: CreateCategory): Observable<Category> {
    return this.http.post<Category>(this.api, category);
  }
}
