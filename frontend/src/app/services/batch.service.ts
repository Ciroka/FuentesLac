import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch } from '../models/batch.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private api = `${environment.apiUrl}/batch`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Batch[]> {
    return this.http.get<Batch[]>(this.api);
  }
}
