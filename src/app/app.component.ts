import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { MenuComponent } from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  apiUrl = environment.apiUrl;
  isAuthenticated = false; // 👈 Adicione esta propriedade

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.http.post<{ idToken: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .subscribe({
        next: r => {
          this.auth['token$']?.next(r.idToken);
          this.isAuthenticated = true; // 👈 Atualize a propriedade
        },
        error: () => {
          this.auth['token$']?.next(null);
          this.isAuthenticated = false; // 👈 Atualize a propriedade
          this.redirectToLogin();
        }
      });
  }

  redirectToLogin(){
    this.router.navigate(['/login']);
  }
}
