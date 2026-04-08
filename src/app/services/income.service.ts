import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface Income {
  id?: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  receivedDate: string;
  paymentMethod?: string;
  isRecurring: boolean;
  createdDate?: string;
}

export type CreateIncomePayload = Omit<Income, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  apiUrl = environment.apiUrl;
  apiUrlDev = environment.apiUrlDev;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getAllIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.apiUrl}/income/list`, {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    });
  }

  // POST - Adicionar nova receita
  addIncome(income: CreateIncomePayload): Observable<Income> {
    return this.http.post<Income>(`${this.apiUrl}/income/add`, income, {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    });
  }

  // PATCH - Atualizar receita existente
  updateIncome(id: string, income: Partial<Income>): Observable<Income> {
    return this.http.patch<Income>(`${this.apiUrl}/income/update/${id}`, income, {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    });
  }

  // DELETE - Remover receita
  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/income/delete/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    });
  }
}
