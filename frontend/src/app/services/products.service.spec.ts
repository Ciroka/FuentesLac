import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductsService } from './products.service';
import { environment } from '../../environments/environment';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create posts the new product', () => {
    service.create({ name: 'Vela', costPrice: 500, minStock: 3 }).subscribe();

    const req = httpMock.expectOne(environment.apiUrl + '/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Vela', costPrice: 500, minStock: 3 });
    req.flush({ id: 1, name: 'Vela', costPrice: 500, salePrice: 800, marginPercent: 0.3, minStock: 3 });
  });

  it('update patches the product by id', () => {
    service.update(3, { salePrice: 150 }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/3`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ salePrice: 150 });
    req.flush({ id: 3, name: 'Queso Cremoso', salePrice: 150, costPrice: 90, marginPercent: 0.3, minStock: 10 });
  });

  it('remove deletes the product by id', () => {
    service.remove(3).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 3 });
  });
});
