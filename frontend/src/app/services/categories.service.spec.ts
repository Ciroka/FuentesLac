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
});
