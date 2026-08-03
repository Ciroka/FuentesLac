import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BatchService } from './batch.service';
import { environment } from '../../environments/environment';

describe('BatchService', () => {
  let service: BatchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BatchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('findAll unwraps the paginated items', () => {
    let result: unknown;
    service.findAll().subscribe(res => (result = res));

    httpMock
      .expectOne(`${environment.apiUrl}/batch?limit=1000`)
      .flush({ items: [{ id: 1, currentStock: 5, productId: 1 }], total: 1, page: 1, limit: 1000 });

    expect(result).toEqual([{ id: 1, currentStock: 5, productId: 1 }]);
  });

  it('findPage sends productId, sortBy and order as query params', () => {
    let result: unknown;
    service.findPage(2, 10, { productId: 3, sortBy: 'yield', order: 'DESC' }).subscribe(res => (result = res));

    const req = httpMock.expectOne(
      `${environment.apiUrl}/batch?page=2&limit=10&productId=3&sortBy=yield&order=DESC`
    );
    req.flush({ items: [], total: 0, page: 2, limit: 10 });

    expect(result).toEqual({ items: [], total: 0, page: 2, limit: 10 });
  });

  it('findPage omits productId/sortBy/order when not provided', () => {
    service.findPage().subscribe();

    httpMock
      .expectOne(`${environment.apiUrl}/batch?page=1&limit=10`)
      .flush({ items: [], total: 0, page: 1, limit: 10 });
  });
});
