import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.model';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const user = {
    id: '1',
    email: 'user@fuentelac.com',
    role: UserRole.EMPLOYEE,
    createdAt: new Date(),
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('login sets the current user from the response and sends credentials', () => {
    service.login('user@fuentelac.com', 'secret').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.withCredentials).toBe(true);
    req.flush({ user });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()).toEqual(user);
  });

  it('restoreSession skips the network call when there is no session hint (never logged in)', async () => {
    const resultPromise = firstValueFrom(service.restoreSession());

    httpMock.expectNone(`${environment.apiUrl}/auth/me`);

    expect(await resultPromise).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('restoreSession populates the current user on success when a session hint exists', () => {
    localStorage.setItem('has_session', '1');

    service.restoreSession().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    req.flush(user);

    expect(service.currentUser()).toEqual(user);
  });

  it('restoreSession clears the user and the session hint on 401 instead of throwing', async () => {
    localStorage.setItem('has_session', '1');

    const resultPromise = firstValueFrom(service.restoreSession());

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(await resultPromise).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('has_session')).toBeNull();
  });

  it('login sets the session hint so a later restoreSession will actually check the server', () => {
    service.login('user@fuentelac.com', 'secret').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ user });

    expect(localStorage.getItem('has_session')).toBe('1');
  });

  it('register posts credentials without touching the current session', () => {
    service.register('New User', 'new@fuentelac.com', 'secret123').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body).toEqual({
      name: 'New User',
      email: 'new@fuentelac.com',
      password: 'secret123',
    });
    req.flush({ user: { ...user, id: '2', email: 'new@fuentelac.com' } });

    expect(service.isLoggedIn()).toBe(false);
  });

  it('clearSession resets the user and the session hint without an HTTP call', () => {
    localStorage.setItem('has_session', '1');
    service.restoreSession().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush(user);
    expect(service.isLoggedIn()).toBe(true);

    service.clearSession();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('has_session')).toBeNull();
  });
});
