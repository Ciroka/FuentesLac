import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SuppliersService } from './suppliers.service';
import { environment } from '../../environments/environment';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SuppliersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create posts the new supplier', () => {
    service.create({ name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' });
    req.flush({ id: 1, name: 'Tambo SA', phone: '111', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' });
  });

  it('update patches the supplier by id', () => {
    service.update(1, { phone: '222' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ phone: '222' });
    req.flush({ id: 1, name: 'Tambo SA', phone: '222', email: 'a@a.com', address: 'Ruta 1', cuit: '20-1-1' });
  });

  it('remove deletes the supplier by id', () => {
    service.remove(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/suppliers/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 1 });
  });
});
