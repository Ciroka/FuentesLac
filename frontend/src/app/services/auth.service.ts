import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser, UserRole } from '../models/auth.model';

interface LoginResponse {
  user: AuthUser;
}

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
      .pipe(tap(res => this._currentUser.set(res.user)));
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
      .pipe(tap(res => this._currentUser.set(res.user)), map(res => res.user));
  }

  restoreSession(): Observable<AuthUser | null> {
    return this.http
      .get<AuthUser>(`${this.api}/me`, { withCredentials: true })
      .pipe(
        tap(user => this._currentUser.set(user)),
        catchError(() => {
          this._currentUser.set(null);
          return of(null);
        }),
      );
  }

  clearSession(): void {
    this._currentUser.set(null);
  }

  private onLoggedOut(): void {
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
