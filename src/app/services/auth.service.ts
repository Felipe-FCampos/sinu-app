import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithPopup, User } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SecureTokenStore } from '../secure-token.store';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
  uid: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(null);
  private http = inject(HttpClient);
  private secureStore = inject(SecureTokenStore);
  private apiUrl = environment.apiUrl;

  get token(): string | null {
    return this.token$.value;
  }
  get tokenChanges() {
    return this.token$.asObservable();
  }

  /** Deixe público e único */
  setToken(token: string | null) {
    this.token$.next(token);
  }

  async signInWithGoogle(): Promise<{ user: User; idToken: string, googleIdToken?: string }> {
    const auth = getAuth();

    // 1) Login Firebase (nativo ou web)
    let firebaseIdToken: string;
    let user: User;
    let googleIdToken: string | undefined;

    if (Capacitor.isNativePlatform()) {
      const res = await FirebaseAuthentication.signInWithGoogle();
      googleIdToken = res.credential?.idToken || undefined;
      if (!googleIdToken) throw new Error('Google idToken ausente');

      const cred = GoogleAuthProvider.credential(googleIdToken);
      const userCred = await signInWithCredential(auth, cred);
      user = userCred.user;
      firebaseIdToken = await user.getIdToken();
    } else {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const cred = GoogleAuthProvider.credentialFromResult(result);
      googleIdToken = cred?.idToken || undefined;
      user = result.user;
      firebaseIdToken = await result.user.getIdToken();
    }

    // 2) Troca pelo token do backend
    const session = await firstValueFrom(
      this.http.post<LoginResponse>(
        `${this.apiUrl}/auth/google`,
        { googleIdToken, firebaseIdToken }, // <- nomes batendo com o backend
        { withCredentials: true }
      )
    );

    // 3) Salva refresh no cofre (nativo)
    if (Capacitor.isNativePlatform()) {
      await this.secureStore.setRefresh(session.refreshToken);
    }

    // 4) Seta access token em memória
    this.setToken(session.idToken);

    // 5) Retorna user + token do backend (idToken) + googleIdToken se quiser
    return { user, idToken: session.idToken, googleIdToken };
  }


  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }));
    } catch (error) {
      console.error('Falha ao fazer logout no backend, continuando com o logout local...', error);
    }

    const auth = getAuth();
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
      await this.secureStore.clear();
    }
    await auth.signOut();

    this.setToken(null);
  }
}
