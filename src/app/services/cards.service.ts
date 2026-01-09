import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface Card {
  id: string;
  cardName: string;
  totalSpent: number;
  cardBank: string;
  cardFinalNumbers: string;
  dueDate: number;
  limit: number;
  status: number;
}

// Interface para criar um novo cartão (ajustada para corresponder ao Pydantic)
export interface CreateCardPayload {
  cardName: string;
  cardBank: string;
  cardFinalNumbers: string;
  dueDate: number | null;
  limit: number; // Mantido como number, pois o Angular/TS trata float/int como number
  status: number;
  totalSpent?: number; // Adicionado como opcional para consistência
}

// Interface para atualizar um cartão
export type UpdateCardPayload = Partial<CreateCardPayload>;


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

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authService.token}`
    };
  }

  getAllCards(): Observable<{ cards: Card[] }> {
    return this.http.get<{ cards: Card[] }>(`${this.apiUrl}/cards/list`, {
      headers: this.getAuthHeaders()
    });
  }

  // Adicionar novo cartão
  addCard(card: CreateCardPayload): Observable<any> { 
    return this.http.post<any>(`${this.apiUrl}/cards/create`, card, {
      headers: this.getAuthHeaders()
    });
  }

  // Atualizar cartão existente
  updateCard(id: string, card: UpdateCardPayload): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/cards/update/${id}`, card, {
      headers: this.getAuthHeaders()
    });
  }

  // Deletar cartão
  deleteCard(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
