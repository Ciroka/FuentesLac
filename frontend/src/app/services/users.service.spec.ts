import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('findAll unwraps the paginated items', () => {
    let result: unknown;
    service.findAll().subscribe(res => (result = res));

    httpMock
      .expectOne(`${environment.apiUrl}/users?limit=1000`)
      .flush({ items: [{ id: '1', email: 'a@a.com' }], total: 1, page: 1, limit: 1000 });

    expect(result).toEqual([{ id: '1', email: 'a@a.com' }]);
  });

  it('updateRole sends a PATCH with the new role', () => {
    service.updateRole('1', UserRole.ADMIN).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1/role`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: UserRole.ADMIN });
    req.flush({ id: '1', role: UserRole.ADMIN });
  });

  it('remove sends a DELETE', () => {
    service.remove('1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: '1' });
  });
});
