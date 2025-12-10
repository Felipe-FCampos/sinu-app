import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { MenuComponent } from "./components/menu/menu.component"

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.http.post<{ idToken: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .subscribe({
        next: r => {
          this.auth.setToken(r.idToken);
        },
        error: () => {
          this.auth.setToken(null);

          if (!this.router.url.includes('/login')) {
            this.redirectToLogin();
          }
        }
      });
  }

  redirectToLogin(){
    this.router.navigate(['/login']);
  }
}
