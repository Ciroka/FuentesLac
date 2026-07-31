import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  const user = { id: '1', email: 'a@a.com', role: UserRole.EMPLOYEE, createdAt: new Date() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  /** Simulates an already-logged-in session by populating AuthService.currentUser. */
  async function seedLoggedInSession(): Promise<void> {
    const loginPromise = firstValueFrom(authService.login('a@a.com', 'pass'));
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ user });
    await loginPromise;
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('refreshes the session and retries the original request on 401', async () => {
    const resultPromise = firstValueFrom(http.get(`${environment.apiUrl}/products`));

    const originalReq = httpMock.expectOne(`${environment.apiUrl}/products`);
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(refreshReq.request.withCredentials).toBe(true);
    refreshReq.flush({ user });

    const retryReq = httpMock.expectOne(`${environment.apiUrl}/products`);
    retryReq.flush({ ok: true });

    expect(await resultPromise).toEqual({ ok: true });
  });

  it('shares a single refresh call across concurrent 401s', async () => {
    const first = firstValueFrom(http.get(`${environment.apiUrl}/products`));
    const second = firstValueFrom(http.get(`${environment.apiUrl}/clients`));

    httpMock
      .expectOne(`${environment.apiUrl}/products`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${environment.apiUrl}/clients`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReqs = httpMock.match(`${environment.apiUrl}/auth/refresh`);
    expect(refreshReqs.length).toBe(1);
    refreshReqs[0].flush({ user });

    httpMock.expectOne(`${environment.apiUrl}/products`).flush({ ok: 1 });
    httpMock.expectOne(`${environment.apiUrl}/clients`).flush({ ok: 2 });

    expect(await first).toEqual({ ok: 1 });
    expect(await second).toEqual({ ok: 2 });
  });

  it('redirects to /login without attempting a refresh when /auth/refresh itself 401s, if there was an active session', async () => {
    await seedLoggedInSession();

    const resultPromise = firstValueFrom(http.post(`${environment.apiUrl}/auth/refresh`, {}));

    httpMock
      .expectOne(`${environment.apiUrl}/auth/refresh`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await expect(resultPromise).rejects.toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('clears the session and redirects when the refresh call fails, if there was an active session', async () => {
    await seedLoggedInSession();

    const resultPromise = firstValueFrom(http.get(`${environment.apiUrl}/products`));

    httpMock
      .expectOne(`${environment.apiUrl}/products`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    httpMock
      .expectOne(`${environment.apiUrl}/auth/refresh`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await expect(resultPromise).rejects.toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does NOT redirect when there was no active session (e.g. the initial anonymous session-restore check on a public page)', async () => {
    const resultPromise = firstValueFrom(http.get(`${environment.apiUrl}/auth/me`));

    httpMock
      .expectOne(`${environment.apiUrl}/auth/me`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    httpMock
      .expectOne(`${environment.apiUrl}/auth/refresh`)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await expect(resultPromise).rejects.toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
