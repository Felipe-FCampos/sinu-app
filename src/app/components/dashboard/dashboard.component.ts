import { Component, OnInit } from '@angular/core';
import { Subscription, SubscriptionStatus } from '../subscriptions/subscriptions.component';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';
import { Card, CardsService, StandalonePayment } from 'src/app/services/cards.service';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';

registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

interface UnifiedPaymentItem {
  price: number;
  currency: string;
  cardFinalNumbers?: string | null;
}

// Interface para o novo resumo da API
interface FinancialSummary {
  total_spent: number;
  total_received: number;
  balance: number;
  currency: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, KeyValuePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  // Novo estado para o resumo do endpoint
  financialSummary: FinancialSummary = {
    total_spent: 0,
    total_received: 0,
    balance: 0,
    currency: 'BRL'
  };

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
    private dashboardService: DashboardService,
    private cardService: CardsService
  ) { }

  ngOnInit() {
    this.loadAllData();
  }

  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL': return 'pt-BR';
      case 'EUR': return 'de-DE';
      case 'USD':
      case 'AUD': return 'en-US';
      default: return 'en-US';
    }
  }

  loadAllData() {
    // Adicionamos o getFinancialSummary ao forkJoin para buscar em paralelo
    forkJoin({
      subscriptions: this.subscriptionsService.getAllSubscriptions(),
      standalonePayments: this.cardService.getAllStandalonePayments(),
      summary: this.dashboardService.getFinancialSummary()
    }).pipe(
      map(({ subscriptions, standalonePayments, summary }) => ({
        subscriptions: subscriptions as Subscription[],
        standalonePayments: standalonePayments as StandalonePayment[],
        summary: summary as FinancialSummary
      }))
    ).subscribe(({ subscriptions, standalonePayments, summary }) => {

      // 1. Atribui o resumo vindo da API (Consolidado em BRL)
      this.financialSummary = {
        total_spent: summary.total_spent / 100,
        total_received: summary.total_received / 100,
        balance: summary.balance / 100,
        currency: summary.currency
      };

      // 2. Processa as assinaturas (contagem de status)
      this.processSubscriptions(subscriptions);

      // 3. Mantém a lógica de unificação para o detalhamento por moeda/cartão
      const unifiedPayments: UnifiedPaymentItem[] = [];

      const activeSubscriptions = subscriptions
        .filter(sub => sub.status === SubscriptionStatus.Active || sub.status === SubscriptionStatus.Expiring)
        .map(sub => ({
          price: sub.price / 100,
          currency: sub.currency,
          cardFinalNumbers: sub.cardFinalNumbers
        }));

      const allStandalonePayments = standalonePayments.map(p => ({
        price: p.price / 100,
        currency: 'BRL',
        cardFinalNumbers: p.cardFinalNumbers
      }));

      unifiedPayments.push(...activeSubscriptions, ...allStandalonePayments);

      // 4. Calcula os totais detalhados que você já tinha
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
    this.totalCostsByCurrency = {};
    this.totalCostsByCard = {};

    payments.forEach(item => {
      if (!this.totalCostsByCurrency[item.currency]) {
        this.totalCostsByCurrency[item.currency] = 0;
      }
      this.totalCostsByCurrency[item.currency] += item.price;

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