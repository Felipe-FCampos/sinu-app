import { Component, OnInit } from '@angular/core';
import { Subscription, SubscriptionStatus } from '../subscriptions/subscriptions.component';
import { SubscriptionsService } from 'src/app/subscriptions.service';
import { DatePipe, CurrencyPipe, KeyValuePipe } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';

// Registre os locales que você vai usar
registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, KeyValuePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  subscriptions: Subscription[] = [];
  totalCostsByCurrency: { [key: string]: number } = {};

  totalSubscriptionsCount: number = 0;
  activeSubscriptionsCount: number = 0;
  dueSubscriptionsCount: number = 0;      // Status 'À vencer'
  expiredSubscriptionsCount: number = 0;  // Status 'Vencido'
  disabledSubscriptionsCount: number = 0; // Status 'Desativado'

  constructor(
    private subscriptionsService: SubscriptionsService
  ) { }

  ngOnInit() {
    this.listSubscriptions();
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

  listSubscriptions() {
    this.subscriptionsService.getAllSubscriptions().subscribe((data: any) => {
      const arr = data as any[];
      this.subscriptions = arr.map(sub => ({
        ...sub,
        price: sub.price / 100,
        status: Number(sub.status) as SubscriptionStatus,
      }));

      if (this.subscriptions.length > 0) {
        this.countTotal();
      }
    });
  }

  countTotal() {
    this.totalCostsByCurrency = {};
    this.totalSubscriptionsCount = 0;
    this.activeSubscriptionsCount = 0;
    this.dueSubscriptionsCount = 0;
    this.expiredSubscriptionsCount = 0;
    this.disabledSubscriptionsCount = 0;

    this.subscriptions.forEach(sub => {
      switch (sub.status) {
        case SubscriptionStatus.Active:
          this.activeSubscriptionsCount++;
          // Adiciona ao custo total apenas se estiver ativa
          if (!this.totalCostsByCurrency[sub.currency]) {
            this.totalCostsByCurrency[sub.currency] = 0;
          }
          this.totalCostsByCurrency[sub.currency] += sub.price;
          break;
        case SubscriptionStatus.Expiring:
          this.dueSubscriptionsCount++;
          break;
        case SubscriptionStatus.Expired:
          this.expiredSubscriptionsCount++;
          break;
        case SubscriptionStatus.Disabled:
          this.disabledSubscriptionsCount++;
          break;
      }
      this.totalSubscriptionsCount++;
    });
  }
}
