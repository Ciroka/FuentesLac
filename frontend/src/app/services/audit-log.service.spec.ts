import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuditLogService } from './audit-log.service';
import { environment } from '../../environments/environment';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuditLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the given page and limit', () => {
    service.findAll(2, 10).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/audit-logs?page=2&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0, page: 2, limit: 10 });
  });
});
