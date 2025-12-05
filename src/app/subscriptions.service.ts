import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface CreateSubscriptionPayload {
  name: string;
  description?: string | null;
  price: number;                
  currency: string;
  subscriptionType: string;
  billingDay: number | null;
  billingFrequency: string;
  createdDate: string;
  nextPayment: string;          
  paymentMethod: string;
  status: number;               
  cardBank?: string | null;
  cardFinalNumbers?: string | null;
}


@Injectable({
  providedIn: 'root',
})
export class SubscriptionsService {
    apiUrl = environment.apiUrl;
  
    constructor(
      private authService: AuthService,
      private http: HttpClient
    ) { }

    getAllSubscriptions() {
      return this.http.get(`${this.apiUrl}/subscription/list`, {
        headers: {
          'Authorization': `Bearer ${this.authService.token}`
        }
      });
    }

    addSubscription(subscriptionData: CreateSubscriptionPayload) {
      return this.http.post(`${this.apiUrl}/subscription/add`, subscriptionData, {
        headers: {
          'Authorization': `Bearer ${this.authService.token}`
        }
      });
    }
  }
