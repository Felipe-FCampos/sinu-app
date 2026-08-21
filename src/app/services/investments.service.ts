import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface InvestmentTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'yield';
  amount: number;
  balance_before?: number;
  balance_after: number;
  timestamp: string;
  note?: string;
}

export interface Investment {
  id: string;
  name: string;
  investment_type: string;
  final_value: number;
  cdi_percentage?: number | null;
  status: string;
  notes?: string | null;
  history: InvestmentTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentPayload {
  name: string;
  investment_type: string;
  initial_value: number;
  cdi_percentage?: number | null;
  status?: string;
  notes?: string | null;
}

export interface UpdateInvestmentPayload {
  name?: string;
  investment_type?: string;
  cdi_percentage?: number | null;
  status?: string;
  notes?: string | null;
}

export interface AddTransactionPayload {
  type: 'deposit' | 'withdrawal' | 'yield';
  amount: number;
  note?: string;
}

export interface YieldUpdatePayload {
  new_total_balance: number;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvestmentsService {
  apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  private get headers() {
    return {
      headers: {
        'Authorization': `Bearer ${this.authService.token}`
      }
    };
  }

  getAllInvestments(): Observable<{ investments: Investment[] }> {
    return this.http.get<{ investments: Investment[] }>(`${this.apiUrl}/investments/list`, this.headers);
  }

  getInvestmentById(id: string): Observable<{ investment: Investment }> {
    return this.http.get<{ investment: Investment }>(`${this.apiUrl}/investments/${id}`, this.headers);
  }

  addInvestment(payload: CreateInvestmentPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/investments/create`, payload, this.headers);
  }

  updateInvestment(id: string, payload: UpdateInvestmentPayload): Observable<any> {
    return this.http.patch(`${this.apiUrl}/investments/update/${id}`, payload, this.headers);
  }

  addTransaction(id: string, payload: AddTransactionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/investments/${id}/transaction`, payload, this.headers);
  }

  updateYieldByBalance(id: string, payload: YieldUpdatePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/investments/${id}/yield-update`, payload, this.headers);
  }

  deleteInvestment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/investments/delete/${id}`, this.headers);
  }
}