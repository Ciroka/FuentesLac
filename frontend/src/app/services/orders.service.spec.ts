import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../models/order.model';
import { environment } from '../../environments/environment';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('findAll pide los pedidos más nuevos primero y convierte los decimales a número', () => {
    let received: { orderedTotal: number; unitPrice: number } | undefined;

    service.findAll().subscribe(orders => {
      received = {
        orderedTotal: orders[0].orderedTotal,
        unitPrice: orders[0].ordersDetails![0].unitPrice,
      };
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders?limit=1000&order=DESC`);
    expect(req.request.method).toBe('GET');

    req.flush({
      items: [
        {
          id: 1,
          date: '2026-07-28',
          status: OrderStatus.PENDING,
          orderedTotal: '142500.00',
          arrivalTotal: '0.00',
          ordersDetails: [
            {
              id: 10,
              supply: { id: 5, name: 'Leche entera' },
              orderedQuantity: 20,
              arrivalQuantity: 0,
              unitPrice: '2100.00',
              orderedSubtotal: '42000.00',
              arrivalSubtotal: '0.00',
            },
          ],
        },
      ],
    });

    // TypeORM devuelve las columnas decimal de Postgres como string y el pipe
    // currency de Angular no las formatea.
    expect(received!.orderedTotal).toBe(142500);
    expect(received!.unitPrice).toBe(2100);
  });

  it('registerArrival hace PATCH al endpoint de llegada', () => {
    service.registerArrival(7, { details: [{ supplyId: 5, quantity: 18 }] }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/7/arrival`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ details: [{ supplyId: 5, quantity: 18 }] });
    req.flush({ id: 7, status: OrderStatus.RECEIVED, orderedTotal: '0', arrivalTotal: '0', ordersDetails: [] });
  });

  it('cancel hace PATCH sin body', () => {
    service.cancel(7).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/7/cancel`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush({ id: 7, status: OrderStatus.CANCELLED, orderedTotal: '0', arrivalTotal: '0', ordersDetails: [] });
  });
});
