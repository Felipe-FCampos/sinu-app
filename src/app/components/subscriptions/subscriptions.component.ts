import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

export enum SubscriptionStatus {
  Disabled = 0,
  Active = 1,
  Pending = 2,
  Expired = 3,
}

export interface Subscription {
  name: string,
  description: string,
  price: number,
  currency: string,
  subscriptionType: string,
  billingDay: number,
  billingFrequency: string,
  createdDate: Timestamp,
  nextPayment: Timestamp,
  paymentMethod: string,
  status: SubscriptionStatus,
  cardBank?: string,
  cardFinalNumbers?: string,
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent {
  subscriptions: Subscription[] = [
    {
      name: 'Netflix',
      price: 5000,
      currency: 'BRL',
      description: 'Plano Premium',
      subscriptionType: 'STREAMING',
      billingDay: 15,
      billingFrequency: 'MONTHLY',
      createdDate: Timestamp.fromDate(new Date('2023-05-10')),
      nextPayment: Timestamp.fromDate(new Date('2023-12-15')),
      status: SubscriptionStatus.Active,
      cardBank: 'nubank',
      cardFinalNumbers: '1234',
      paymentMethod: 'CREDIT_CARD'
    }
  ]

  getStatusLabel(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.Active: return 'Ativo';
      case SubscriptionStatus.Pending: return 'Pendente';
      case SubscriptionStatus.Expired: return 'Vencido';
      case SubscriptionStatus.Disabled: return 'Desativado';
      default: return 'Desconhecido';
    }
  }

}