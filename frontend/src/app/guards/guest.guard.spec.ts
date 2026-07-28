import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { guestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

describe('guestGuard', () => {
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
      guestGuard({} as never, { url: '/login' } as never),
    );

  it('allows navigation to /login when logged out', () => {
    expect(runGuard()).toBe(true);
  });

  it('redirects to /home when already logged in', () => {
    authService.login('a@a.com', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      user: { id: '1', email: 'a@a.com', role: UserRole.EMPLOYEE, createdAt: new Date() },
    });

    expect(runGuard()).toEqual(router.createUrlTree(['/home']));
  });
});
