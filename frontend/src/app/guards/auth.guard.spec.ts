import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/home' } as never),
    );

  it('allows navigation when logged in', () => {
    authService.login('a@a.com', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      user: { id: '1', email: 'a@a.com', role: UserRole.EMPLOYEE, createdAt: new Date() },
    });

    expect(runGuard()).toBe(true);
  });

  it('redirects to /login when logged out', () => {
    const result = runGuard();
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
