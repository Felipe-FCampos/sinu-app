import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData, } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de'; // Exemplo se você mapear 'EUR' para 'de-DE'
import { CreateSubscriptionPayload, SubscriptionsService } from 'src/app/subscriptions.service';
import { FormsModule } from '@angular/forms';

registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

export enum SubscriptionStatus {
  Disabled = 0,
  Active = 1,
  Pending = 2,
  Expired = 3,
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  subscriptionType: string;
  billingDay: number;
  billingFrequency: string;
  createdDate: string;
  nextPayment: string;
  paymentMethod: string;
  status: SubscriptionStatus;
  cardBank?: string | null;
  cardFinalNumbers?: string | null;
}

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {

  constructor(private subscriptionsService: SubscriptionsService) { }

  subscriptions: Subscription[] = [];

  isSubmitting = false;   // 👈 loader
  showSuccess = false;    // 👈 modal de sucesso

  days: number[] = Array.from({ length: 30 }, (_, i) => i + 1); // Gera os dias de 1 a 30

  newSubscription: CreateSubscriptionPayload = {
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    subscriptionType: '',
    billingDay: null,
    billingFrequency: 'MONTHLY',
    createdDate: new Date().toISOString(),
    nextPayment: '',
    paymentMethod: 'CREDIT_CARD',
    status: SubscriptionStatus.Active
  };

  resetNewSubscription() {
    this.newSubscription = {
      name: '',
      description: '',
      price: 0,
      currency: 'BRL',
      subscriptionType: '',
      billingDay: null,
      billingFrequency: 'MONTHLY',
      createdDate: new Date().toISOString(),
      nextPayment: '',
      paymentMethod: 'CREDIT_CARD',
      status: SubscriptionStatus.Active,
      cardBank: null,
      cardFinalNumbers: ''
    };
  }

  ngOnInit() {
    this.listSubscriptions();
  }

  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL':
        return 'pt-BR';
      case 'EUR': // Geralmente Europa usa vírgula decimal
        return 'de-DE';
      case 'USD':
      case 'AUD':
        return 'en-US'; // Geralmente padrão anglófono (ponto decimal)
      default:
        // Padrão de segurança: use o localizador do seu país ou o padrão internacional
        return 'en-US';
    }
  }

  public convertTimestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  getStatusLabel(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.Active: return 'Ativo';
      case SubscriptionStatus.Pending: return 'Pendente';
      case SubscriptionStatus.Expired: return 'Vencido';
      case SubscriptionStatus.Disabled: return 'Desativado';
      default: return 'Desconhecido';
    }
  }

  openAddSubscriptionForm() {
    const forms = document.querySelector('.add-subscription-section') as HTMLElement;
    const div = document.querySelector('.div_background_modal') as HTMLElement;
    div.style.display = 'block';
    forms.style.display = 'block';
  }

  closeAddSubscriptionForm() {
    const forms = document.querySelector('.add-subscription-section') as HTMLElement;
    const div = document.querySelector('.div_background_modal') as HTMLElement;
    div.style.display = 'none';
    forms.style.display = 'none';
    this.isSubmitting = false;
  }

  listSubscriptions() {
    this.subscriptionsService.getAllSubscriptions().subscribe((data: any) => {
      const arr = data as any[];
      this.subscriptions = arr.map(sub => ({
        ...sub,
        status: Number(sub.status) as SubscriptionStatus,
      }));
      console.log('Subscriptions: ', this.subscriptions);
    });
  }

  addSubscription() {
    const createdDate = new Date(this.newSubscription.createdDate);
    const billingDay = this.newSubscription.billingDay;
    const billingFrequency = this.newSubscription.billingFrequency;

    // Calcula a data do próximo pagamento
    if (billingDay === null) return;

    const nextPayment = this.calculateNextPayment(createdDate, billingDay, billingFrequency);

    const newSubscription: CreateSubscriptionPayload = {
      name: this.newSubscription.name,
      description: this.newSubscription.description,
      price: this.newSubscription.price,
      currency: this.newSubscription.currency,
      subscriptionType: this.newSubscription.subscriptionType,
      billingDay: billingDay,
      billingFrequency: billingFrequency,
      createdDate: createdDate.toISOString(),
      nextPayment: nextPayment.toISOString(),
      paymentMethod: this.newSubscription.paymentMethod,
      status: SubscriptionStatus.Active,
      cardBank: this.newSubscription.cardBank || null,
      cardFinalNumbers: this.newSubscription.cardFinalNumbers || null,
    }

      this.isSubmitting = true;    // 👈 começa o loader
      this.showSuccess = false; 

    this.subscriptionsService.addSubscription(newSubscription).subscribe({
      next: (response) => {
        console.log('Subscription added:', response);
        this.listSubscriptions(); // Refresh the list after adding
        this.resetNewSubscription();
        this.isSubmitting = false;   // 👈 para loader
        this.showSuccess = true;
        this.closeAddSubscriptionForm();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;   // garante que não fique travado
      }
    });
  }

  calculateNextPayment(createdDate: Date, billingDay: number, billingFrequency: string): Date {
    const nextPayment = new Date(createdDate);

    // Ajusta o dia do mês para o dia de cobrança
    nextPayment.setDate(billingDay);

    // Se o dia ajustado for anterior à data de criação, avança para o próximo mês
    if (nextPayment < createdDate) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }

    // Aplica a frequência de cobrança
    switch (billingFrequency) {
      case 'MONTHLY':
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextPayment.setMonth(nextPayment.getMonth() + 3);
        break;
      case 'SEMESTRAL':
        nextPayment.setMonth(nextPayment.getMonth() + 6);
        break;
      case 'ANNUAL':
        nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        break;
      default:
        throw new Error('Frequência de cobrança inválida');
    }

    return nextPayment;
  }
}