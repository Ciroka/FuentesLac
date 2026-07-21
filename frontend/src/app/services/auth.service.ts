import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt: Date;
}

interface LoginResponse {
  user: AuthUser;
  access_token: string;
}

const STORAGE_KEY_TOKEN = 'stockai_token';
const STORAGE_KEY_USER = 'stockai_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private api = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.access_token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  getUserRole(): 'ADMIN' | 'EMPLOYEE' | null {
    return this.getUser()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    this.router.navigate(['/login']);
  }
}
