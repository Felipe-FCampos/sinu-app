import { Component, OnInit } from '@angular/core';
import { CardsInfoComponent } from 'src/app/components/cards-info/cards-info.component';
import { UserData, UserService } from 'src/app/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Card, CardsService, Invoice, StandalonePayment } from 'src/app/services/cards.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Subscription } from 'src/app/components/subscriptions/subscriptions.component';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CardsInfoComponent, CommonModule],
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent implements OnInit {
  user: UserData | null = null;
  card: Card | null = null;
  subscriptions: Subscription[] = [];
  standalonePayments: StandalonePayment[] = [];
  invoices: Invoice[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private cardsService: CardsService,
    private subscriptionsService: SubscriptionsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const cardId = this.route.snapshot.paramMap.get('id');

    if (!cardId) {
      this.error = 'ID do cartão não encontrado.';
      this.isLoading = false;
      return;
    }

    forkJoin({
      user: this.userService.getUserData(),
      card: this.cardsService.getCardById(cardId),
      subscriptions: this.subscriptionsService.getAllSubscriptions(),
      standalonePayments: this.cardsService.getAllStandalonePayments(),
      invoices: this.cardsService.getAllInvoices(),
    }).subscribe({
      next: (results: any) => {
        this.user = results.user;
        this.card = results.card.card;

        // Filtra a lista de assinaturas
        if (this.card && results.subscriptions) {
          this.subscriptions = results.subscriptions.filter(
            (sub: Subscription) => sub.cardFinalNumbers === this.card?.cardFinalNumbers
          );
        }

        if (this.card && results.standalonePayments) {
          this.standalonePayments = results.standalonePayments.filter(
            (payment: StandalonePayment) => payment.cardFinalNumbers === this.card?.cardFinalNumbers && payment.cardBank === this.card?.cardBank
          );
        }

        if (this.card && results.invoices) {
          this.invoices = results.invoices.filter(
            (invoice: Invoice) => invoice.cardFinalNumbers === this.card?.cardFinalNumbers
          );
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar dados da página: ', err);
        this.error = 'Não foi possível carregar os dados. Tente novamente mais tarde.';
        this.isLoading = false;
      },
    });
  }
}
