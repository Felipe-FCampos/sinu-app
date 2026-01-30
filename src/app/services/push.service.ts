import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PushService {
  apiUrl = environment.apiUrl;
  apiUrlDev = environment.apiUrlDev;

  private initialized = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authService.token}`
    };
  }

  async init() {
    if (this.initialized) return;

    // 1. Permissões
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Notificações não autorizadas');
      return;
    }

    // 2. Listeners
    this.setupListeners();

    // 3. Registrar para receber push
    await PushNotifications.register();

    this.initialized = true;
  }

  private setupListeners() {
    PushNotifications.addListener('registration', (token: Token) => {
      this.http
        .post(
          `${this.apiUrlDev}/user/push-token`,
          { token: token.value },
          {
            headers: this.getAuthHeaders()
          }
        )
        .subscribe({
          next: () => console.log('Token salvo no backend'),
          error: (err) => console.error('Erro ao salvar token no backend', err),
        });
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Erro ao registrar push', error);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Notificação recebida (foreground):', notification);
        // TODO: exibir algum toast/badge, se quiser
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Ação na notificação:', action);
        const data = action.notification.data;
        // TODO: navegar pra tela específica usando o router, ex:
        // if (data?.screen === 'subscription') this.router.navigate(['/subscription', data.id]);
      }
    );
  }
}
