import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth/authService';

// Estado compartido para evitar múltiples refresh simultáneos
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si no es 401, o si es el propio endpoint de login/refresh, no hacemos nada especial
      if (error.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      return handle401(req, next, authService);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') ||
    url.includes('/auth/login/google') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/logout');
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        if (!response.data) {
          isRefreshing = false;
          authService.forceLogout();
          return throwError(() => new Error('No se pudo refrescar la sesión'));
        }

        isRefreshing = false;
        const newToken = response.data.accessToken;

        authService.saveSession(response.data);
        refreshTokenSubject.next(newToken);

        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next(retryReq);
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.forceLogout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((newToken) => {
        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next(retryReq);
      })
    );
  }
}