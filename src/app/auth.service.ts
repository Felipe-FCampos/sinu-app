import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithPopup, User } from 'firebase/auth';

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

    if (Capacitor.isNativePlatform()) {

      const res = await FirebaseAuthentication.signInWithGoogle();
      const googleIdToken = res.credential?.idToken;
      if (!googleIdToken) throw new Error('Google idToken ausente');


      const cred = GoogleAuthProvider.credential(googleIdToken);
      const userCred = await signInWithCredential(auth, cred);
      const firebaseIdToken = await userCred.user.getIdToken();

      return { user: userCred.user, idToken: firebaseIdToken, googleIdToken };
    }

    // Web
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const cred = GoogleAuthProvider.credentialFromResult(result);
    const googleIdToken = cred?.idToken || undefined;
    const firebaseIdToken = await result.user.getIdToken();

    return { user: result.user, idToken: firebaseIdToken, googleIdToken };
  }

  async signOut(): Promise<void> {
    const auth = getAuth();
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    await auth.signOut();
    this.setToken(null);
  }
}
