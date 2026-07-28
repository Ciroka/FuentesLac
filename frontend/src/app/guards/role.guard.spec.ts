import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

describe('roleGuard', () => {
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

  const loginAs = (role: UserRole) => {
    authService.login('a@a.com', 'secret').subscribe();
    httpMock
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ user: { id: '1', email: 'a@a.com', role, createdAt: new Date() } });
  };

  it('allows navigation when the user has an allowed role', () => {
    loginAs(UserRole.ADMIN);
    const guard = roleGuard(UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('redirects to /home when the role is not allowed', () => {
    loginAs(UserRole.EMPLOYEE);
    const guard = roleGuard(UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard({} as never, {} as never));

    expect(result).toEqual(router.createUrlTree(['/home']));
  });

  it('redirects to /home when there is no logged-in user', () => {
    const guard = roleGuard(UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard({} as never, {} as never));

    expect(result).toEqual(router.createUrlTree(['/home']));
  });
});
