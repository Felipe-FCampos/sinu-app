import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs'; // 1. Importe o Observable

export interface Card {
  id: string;
  cardName: string;
  totalSpent: number;
  cardbank: string;
  cardFinalNumbers: string;
  dueDate: number;
  limit: number;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class CardsService {
    apiUrl = environment.apiUrl;
    apiUrlDev = environment.apiUrlDev;
    
      constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

   // 2. Defina o tipo de retorno da função como Observable<Card[]>
   getAllCards(): Observable<Card[]> {
    // 3. Adicione o tipo <Card[]> ao método http.get
    return this.http.get<Card[]>(`${this.apiUrlDev}/cards/list`, {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    });
  }
}
