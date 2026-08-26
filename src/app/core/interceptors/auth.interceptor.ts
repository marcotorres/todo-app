import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { StorageService, AuthService } from '@core/services';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const isRefreshRequest = req.url.includes('/users/refresh');
  if (isRefreshRequest) {
    return next(req);
  }

  const token = storage.getToken();
  let authReq = addTokenToRequest(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshRequest) {
        return handleTokenRefresh(req, next, storage, router, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (token) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return req;
}

function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  storage: StorageService,
  router: Router,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((success) => {
        isRefreshing = false;
        if (success) {
          const newToken = storage.getToken();
          refreshTokenSubject.next(newToken);
          return next(addTokenToRequest(req, newToken));
        } else {
          storage.clear();
          router.navigate(['/login']);
          return throwError(() => new Error('Session expired'));
        }
      }),
      catchError((error) => {
        isRefreshing = false;
        storage.clear();
        router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenToRequest(req, token)))
    );
  }
}
