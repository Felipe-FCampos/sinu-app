import { Component, OnInit } from '@angular/core';
import { Subscription, SubscriptionStatus } from '../subscriptions/subscriptions.component';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';
import { Card, CardsService, StandalonePayment } from 'src/app/services/cards.service'; // Importar StandalonePayment
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';
import { forkJoin, map } from 'rxjs'; // Importar map do rxjs

// Registre os locales que você vai usar
registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

// Interface para unificar os itens de gasto
interface UnifiedPaymentItem {
  price: number;
  currency: string;
  cardFinalNumbers?: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true, // standalone: true
  imports: [CurrencyPipe, KeyValuePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  subscriptions: Subscription[] = [];
  totalCostsByCurrency: { [key: string]: number } = {};
  totalCostsByCard: { [cardFinalNumbers: string]: { [currency: string]: number } } = {};

  totalSubscriptionsCount: number = 0;
  activeSubscriptionsCount: number = 0;
  dueSubscriptionsCount: number = 0;
  expiredSubscriptionsCount: number = 0;
  disabledSubscriptionsCount: number = 0;

  constructor(
    private subscriptionsService: SubscriptionsService,
    private cardService: CardsService // Re-injetar o serviço
  ) { }

  ngOnInit() {
    this.loadAllData();
  }

  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL':
        return 'pt-BR';
      case 'EUR':
        return 'de-DE';
      case 'USD':
      case 'AUD':
        return 'en-US';
      default:
        return 'en-US';
    }
  }

  loadAllData() {
    // Usar forkJoin para buscar assinaturas e pagamentos avulsos em paralelo
    forkJoin({
      subscriptions: this.subscriptionsService.getAllSubscriptions(),
      standalonePayments: this.cardService.getAllStandalonePayments()
    }).pipe(
      // Adicione este 'pipe' para garantir a tipagem correta dos dados da API
      map(({ subscriptions, standalonePayments }) => ({
        subscriptions: subscriptions as Subscription[],
        standalonePayments: standalonePayments as StandalonePayment[]
      }))
    ).subscribe(({ subscriptions, standalonePayments }) => {
      
      // Processa as assinaturas (contagem de status)
      this.processSubscriptions(subscriptions);

      // Cria uma lista unificada de itens de gasto
      const unifiedPayments: UnifiedPaymentItem[] = [];

      // Adiciona assinaturas ativas e a vencer à lista unificada
      const activeSubscriptions = subscriptions
        .filter(sub => sub.status === SubscriptionStatus.Active || sub.status === SubscriptionStatus.Expiring) // CORREÇÃO AQUI
        .map(sub => ({
          price: sub.price / 100,
          currency: sub.currency,
          cardFinalNumbers: sub.cardFinalNumbers
        }));
      
      // Adiciona pagamentos avulsos à lista unificada
      const allStandalonePayments = standalonePayments.map(p => ({
        price: p.price / 100,
        currency: 'BRL', // Assumindo que pagamentos avulsos são sempre BRL
        cardFinalNumbers: p.cardFinalNumbers
      }));

      unifiedPayments.push(...activeSubscriptions, ...allStandalonePayments);

      // Calcula os totais com base na lista unificada
      this.calculateTotals(unifiedPayments);
    });
  }

  processSubscriptions(subs: Subscription[]) {
    this.totalSubscriptionsCount = subs.length;
    this.activeSubscriptionsCount = subs.filter(s => s.status === SubscriptionStatus.Active).length;
    this.dueSubscriptionsCount = subs.filter(s => s.status === SubscriptionStatus.Expiring).length;
    this.expiredSubscriptionsCount = subs.filter(s => s.status === SubscriptionStatus.Expired).length;
    this.disabledSubscriptionsCount = subs.filter(s => s.status === SubscriptionStatus.Disabled).length;
  }

  calculateTotals(payments: UnifiedPaymentItem[]) {
    // Reseta os totais
    this.totalCostsByCurrency = {};
    this.totalCostsByCard = {};

    payments.forEach(item => {
      // Calcula o total por moeda
      if (!this.totalCostsByCurrency[item.currency]) {
        this.totalCostsByCurrency[item.currency] = 0;
      }
      this.totalCostsByCurrency[item.currency] += item.price;

      // Calcula o total por cartão
      if (item.cardFinalNumbers) {
        if (!this.totalCostsByCard[item.cardFinalNumbers]) {
          this.totalCostsByCard[item.cardFinalNumbers] = {};
        }
        if (!this.totalCostsByCard[item.cardFinalNumbers][item.currency]) {
          this.totalCostsByCard[item.cardFinalNumbers][item.currency] = 0;
        }
        this.totalCostsByCard[item.cardFinalNumbers][item.currency] += item.price;
      }
    });
  }
}
