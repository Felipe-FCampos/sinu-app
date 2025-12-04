// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';                 
import { SecureTokenStore } from './secure-token.store';  

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);
  const router = inject(Router);
  const secure = inject(SecureTokenStore); 
  const api = environment.apiUrl.replace(/\/$/, '');

  if (auth.token) return true;

  try {
     // APP: tenta com refresh do cofre (body)
    if (Capacitor.isNativePlatform()) {
      const rt = await secure.getRefresh();
      if (rt) {
        const r = await firstValueFrom(
          http.post<{ idToken: string }>(`${api}/auth/refresh`, { refreshToken: rt })
        );
        auth.setToken(r.idToken);
        return true;
      }
    }
    const r = await firstValueFrom(
      http.post<{ idToken: string }>(`${api}/auth/refresh`, {}, { withCredentials: true })
    );
    auth.setToken(r.idToken);
    return true;
  } catch {
    router.navigate(['/login'], { queryParams: { redirect: state.url } });
    return false;
  }
};
