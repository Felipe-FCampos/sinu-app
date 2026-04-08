import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  apiUrl = environment.apiUrl;
  apiUrlDev = environment.apiUrlDev;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getFinancialSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    });
  }
}
