import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { AuthApiService } from '@core/auth/auth-api.service';

const PUBLIC_PATHS = [
  '/auth/register',
  '/auth/verify-phone',
  '/auth/login',
  '/auth/login/verify',
  '/auth/2fa/verify',
  '/auth/refresh',
  '/auth/recover',
  '/auth/recover/verify',
  '/health',
];

function isPublicRequest(url: string): boolean {
  return PUBLIC_PATHS.some((path) => url.includes(path));
}

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const authApi = inject(AuthApiService);

  const token = authService.getAccessToken();
  let cloned = req;

  if (token && !isPublicRequest(req.url)) {
    cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicRequest(req.url)) {
        return handleTokenRefresh(req, next, authService, authApi);
      }
      return throwError(() => error);
    })
  );
};

function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  authApi: AuthApiService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      authService.clearSession();
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    }

    return authApi.refreshToken({ refresh_token: refreshToken }).pipe(
      switchMap((response) => {
        isRefreshing = false;
        authService.updateTokens(response.access_token, response.refresh_token);
        refreshTokenSubject.next(response.access_token);

        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.access_token}`,
            },
          })
        );
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.error(refreshError);
        authService.clearSession();
        return throwError(() => refreshError);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) =>
        next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      )
    );
  }
}
