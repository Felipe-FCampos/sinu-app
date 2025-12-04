// src/app/secure-token.store.ts
import { Injectable } from '@angular/core';
import { SecureStorageEcho, SecureStorageEchoObject } from '@awesome-cordova-plugins/secure-storage-echo/ngx';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class SecureTokenStore {
  private store?: SecureStorageEchoObject;
  private ready = false;

  constructor(private sse: SecureStorageEcho) {}

  private async ensure(): Promise<void> {
    if (this.ready) return;
    if (!Capacitor.isNativePlatform()) {
      // Em web, não há cofre — apenas marque como pronto para evitar erros
      this.ready = true;
      return;
    }
    // cria (ou abre) um “cofre” nomeado
    this.store = await this.sse.create('auth_store');
    this.ready = true;
  }

  /** Salva o refresh token com a chave 'refresh_token' */
  async setRefresh(token: string): Promise<void> {
    await this.ensure();
    if (!Capacitor.isNativePlatform()) return; // ignore no web
    await this.store!.set('refresh_token', token);
  }

  /** Lê o refresh token; retorna null se não existir */
  async getRefresh(): Promise<string | null> {
    await this.ensure();
    if (!Capacitor.isNativePlatform()) return null;
    try {
      return await this.store!.get('refresh_token');
    } catch {
      return null;
    }
  }

  /** Remove o refresh token do cofre */
  async clear(): Promise<void> {
    await this.ensure();
    if (!Capacitor.isNativePlatform()) return;
    try {
      await this.store!.remove('refresh_token');
    } catch {
      // já estava limpo
    }
  }
}
