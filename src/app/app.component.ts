import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient, 
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.http.post<{ idToken: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
    .subscribe({
      next: r => this.auth['token$']?.next(r.idToken),
      error: () => this.auth['token$']?.next(null)
    });
  }
}
