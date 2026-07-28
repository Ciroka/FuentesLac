import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, share, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../models/auth.model';

const NO_REFRESH_ENDPOINTS = ['/auth/refresh', '/auth/login', '/auth/logout'];

let refreshInProgress$: Observable<AuthUser> | null = null;

function getSharedRefresh(authService: AuthService): Observable<AuthUser> {
  if (!refreshInProgress$) {
    refreshInProgress$ = authService.refreshToken().pipe(
      finalize(() => {
        refreshInProgress$ = null;
      }),
      share(),
    );
  }
  return refreshInProgress$;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const reqWithCredentials = req.clone({ withCredentials: true });
  const skipRefresh = NO_REFRESH_ENDPOINTS.some(path => req.url.endsWith(path));

  return next(reqWithCredentials).pipe(
    catchError(err => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      if (skipRefresh) {
        authService.clearSession();
        router.navigate(['/login']);
        return throwError(() => err);
      }

      return getSharedRefresh(authService).pipe(
        switchMap(() => next(reqWithCredentials)),
        catchError(refreshErr => {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshErr);
        }),
      );
    })
  );
};
