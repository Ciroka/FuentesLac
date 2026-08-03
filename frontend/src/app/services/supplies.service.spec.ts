import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SuppliesService } from './supplies.service';
import { environment } from '../../environments/environment';

describe('SuppliesService', () => {
  let service: SuppliesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SuppliesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create posts the new supply', () => {
    service.create({ name: 'Cera', costPrice: 100, minStock: 5 }).subscribe();

    const req = httpMock.expectOne(environment.apiUrl + '/supplies');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Cera', costPrice: 100, minStock: 5 });
    req.flush({ id: 1, name: 'Cera', costPrice: 100, minStock: 5, currentStock: 0, isMilk: false });
  });

  it('update patches the supply by id', () => {
    service.update(1, { currentStock: 20 }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/supplies/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ currentStock: 20 });
    req.flush({ id: 1, name: 'Cera', costPrice: 100, minStock: 5, currentStock: 20, isMilk: false });
  });

  it('remove deletes the supply by id', () => {
    service.remove(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/supplies/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 1 });
  });
});
