import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})

export class UserService {

  apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getUserData() {
      return this.http.get<UserData>(`${this.apiUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.authService.token}`
        }
      });
  }
}
