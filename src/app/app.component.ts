import { Component, OnInit } from '@angular/core';
import { timeout } from 'rxjs/operators';

import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { environment } from 'src/environments/environment';
import { MenuComponent } from "./components/menu/menu.component"

import { AsyncPipe } from '@angular/common';
import { UserData } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  appName: string = 'Sinu v1.0';
  apiUrl = environment.apiUrl;
  isLoading: boolean = true;
  user: UserData | null = null;
  loadingMessage = 'Verificando se é você mesmo...';

  private loadingMessages = [
    'Verificando se é você mesmo...',
    'Quase lá...',
    'Carregando seus dados com carinho...',
  ];
  private loadingStep = 0;
  private loadingTimer?: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.startLoadingMessages();
    this.http.post<{ idToken: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        // 2. Adicione o operador pipe com o timeout (ex: 5000ms = 5 segundos)
        timeout(5000)
      )
      .subscribe({
        next: r => {
          this.auth.setToken(r.idToken);
          this.stopLoading();
        },
        error: () => {
          this.auth.setToken(null);
          this.stopLoading();

          if (!this.router.url.includes('/login')) {
            this.redirectToLogin();
          }
        }
      });
  }

  private startLoadingMessages() {
    this.loadingMessage = this.loadingMessages[0];
    this.loadingStep = 0;

    this.loadingTimer = setInterval(() => {
      this.loadingStep = Math.min(
        this.loadingStep + 1,
        this.loadingMessages.length - 1
      );
      this.loadingMessage = this.loadingMessages[this.loadingStep];
    }, 3000);
  }

  private stopLoading() {
    this.isLoading = false;
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
      this.loadingTimer = undefined;
    }
  }


  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
