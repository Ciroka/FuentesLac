import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser, UserRole } from '../models/auth.model';

interface LoginResponse {
  user: AuthUser;
}

const SESSION_HINT_KEY = 'has_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.userRole() === UserRole.ADMIN);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.api}/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(tap(res => this.onLoggedIn(res.user)));
  }

  register(name: string, email: string, password: string): Observable<{ user: AuthUser }> {
    return this.http.post<{ user: AuthUser }>(`${this.api}/register`, {
      name,
      email,
      password,
    });
  }

  logout(): void {
    this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.onLoggedOut(),
      error: () => this.onLoggedOut(),
    });
  }

  refreshToken(): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${this.api}/refresh`, {}, { withCredentials: true })
      .pipe(tap(res => this.onLoggedIn(res.user)), map(res => res.user));
  }

  /**
   * Las cookies de sesión son httpOnly, así que el frontend no puede leerlas
   * para saber si hay sesión antes de pegarle al backend. Sin esta bandera en
   * localStorage, un visitante que nunca se logueó dispara un GET /auth/me
   * (401 garantizado) seguido de un POST /auth/refresh (también 401) en cada
   * carga de la app. Si nunca hubo sesión, ni siquiera intentamos la request.
   */
  restoreSession(): Observable<AuthUser | null> {
    if (localStorage.getItem(SESSION_HINT_KEY) !== '1') {
      this._currentUser.set(null);
      return of(null);
    }

    return this.http
      .get<AuthUser>(`${this.api}/me`, { withCredentials: true })
      .pipe(
        tap(user => this.onLoggedIn(user)),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      );
  }

  clearSession(): void {
    this._currentUser.set(null);
    localStorage.removeItem(SESSION_HINT_KEY);
  }

  private onLoggedIn(user: AuthUser): void {
    this._currentUser.set(user);
    localStorage.setItem(SESSION_HINT_KEY, '1');
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.api}/me/password`,
      { currentPassword, newPassword },
      { withCredentials: true },
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/reset-password`, { token, password });
  }

  private onLoggedOut(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
