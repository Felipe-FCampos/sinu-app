// auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);

  const apiBase = environment.apiUrl.replace(/\/$/, '');
  const isRefreshCall = req.url.startsWith(`${apiBase}/auth/refresh`);

  const token = auth.token;
  const req2 = token && !isRefreshCall
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` }, withCredentials: true })
    : req.clone({ withCredentials: true });

  return next(req2).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isRefreshCall) {
        // tenta renovar com o cookie HttpOnly (browser) ou body (app, se você enviar)
        return http.post<{ idToken: string }>(`${apiBase}/auth/refresh`, {}, { withCredentials: true }).pipe(
          tap(r => auth.setToken(r.idToken)),
          switchMap(() => {
            const t = auth.token;
            const retry: HttpRequest<any> = t
              ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` }, withCredentials: true })
              : req.clone({ withCredentials: true });
            return next(retry);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
