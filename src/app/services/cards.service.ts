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
  closeDay: number;
  limit: number;
  status: number;
}

// Interface para criar um novo cartão (ajustada para corresponder ao Pydantic)
export interface CreateCardPayload {
  cardName: string;
  cardBank: string;
  cardFinalNumbers: string;
  dueDate: number | null;
  closeDay: number | null;
  limit: number; // Mantido como number, pois o Angular/TS trata float/int como number
  status: number;
  totalSpent?: number; // Adicionado como opcional para consistência
}

export interface StandalonePayment {
    id: string;
    description: string | null;
    title: string;
    price: number;
    category: string;
    installments: number;
    cardBank: string;
    cardFinalNumbers: string;
    purchaseDate: string; // <-- CAMPO ADICIONADO
}

// Payload para criar um novo pagamento avulso
export interface CreateStandalonePaymentPayload {
  title: string;
  price: number;
  category: string;
  installments: number;
  cardBank: string;
  cardFinalNumbers: string;
  purchaseDate: string; // <-- CAMPO ADICIONADO
  description?: string | null;
}

// Representa um item dentro de uma fatura (uma parcela de um pagamento)
export interface InvoiceItem {
    title: string;
    price: number;
    originalPaymentId: string;
    installmentNumber: number;
    totalInstallments: number;
}

// Representa a fatura completa de um cartão em um determinado mês
export interface Invoice {
    id: string;                 
    uid: string;                
    cardFinalNumbers: string;
    closeDate: string;          
    dueDate: string;            
    totalAmount: number;
    items: InvoiceItem[];
    status: 'open' | 'closed' | 'paid'; // Status da fatura
}

// --- FIM DAS NOVAS INTERFACES ---


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

  // Adiciona um novo pagamento avulso (e dispara a criação de faturas na API)
  addStandalonePayment(payment: CreateStandalonePaymentPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payment/standalonepayment/create`, payment, {
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

  // Buscar um cartão pelo ID
  getCardById(id: string): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/cards/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllStandalonePayments(): Observable<StandalonePayment[]> {
    return this.http.get<StandalonePayment[]>(`${this.apiUrl}/payment/standalonepayment/list`, {
      headers: this.getAuthHeaders()
    });
  }

  updateStandalonePayment(paymentId: string, payload: Partial<CreateStandalonePaymentPayload>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/payment/standalonepayment/update/${paymentId}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  // NOVO MÉTODO DE DELETE
  deleteStandalonePayment(paymentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payment/standalonepayment/delete/${paymentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Busca todas as faturas do usuário
  getAllInvoices(): Observable<{ invoices: Invoice[] }> {
    return this.http.get<{ invoices: Invoice[] }>(`${this.apiUrl}/invoices/list`, {
      headers: this.getAuthHeaders()
    });
  }
}
