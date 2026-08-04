import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoriesService } from './categories.service';
import { environment } from '../../environments/environment';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('findAll unwraps the paginated items', () => {
    let result: unknown;
    service.findAll().subscribe(res => (result = res));

    httpMock
      .expectOne(`${environment.apiUrl}/categories?limit=1000`)
      .flush({ items: [{ id: 1, name: 'Lácteos' }], total: 1, page: 1, limit: 1000 });

    expect(result).toEqual([{ id: 1, name: 'Lácteos' }]);
  });

  it('create posts the new category', () => {
    let result: unknown;
    service.create({ name: 'Quesos', description: 'Duros y blandos' }).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Quesos', description: 'Duros y blandos' });
    req.flush({ id: 2, name: 'Quesos', description: 'Duros y blandos' });

    expect(result).toEqual({ id: 2, name: 'Quesos', description: 'Duros y blandos' });
  });

  it('update patches the category by id', () => {
    let result: unknown;
    service.update(2, { name: 'Blandos' }).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Blandos' });
    req.flush({ id: 2, name: 'Blandos' });

    expect(result).toEqual({ id: 2, name: 'Blandos' });
  });

  it('remove deletes the category by id', () => {
    service.remove(2).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 2 });
  });
});
