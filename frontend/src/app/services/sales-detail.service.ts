import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleDetail } from '../models/sale.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesDetailService {
  private api = `${environment.apiUrl}/sales-detail`;
  private readonly http = inject(HttpClient);

  findBySaleId(saleId: number): Observable<SaleDetail[]> {
    return this.http.get<SaleDetail[]>(`${this.api}/sale/${saleId}`);
  }
}
