import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Card, CardsService } from 'src/app/services/cards.service';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de';

// Registra os locales que você vai usar
registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
  cards: Card[] = [];

  constructor(private cardsService: CardsService) {}

  ngOnInit() {
    this.listCards();
  }

  // Adicione esta função
  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL':
        return 'pt-BR';
      case 'EUR':
        return 'de-DE';
      case 'USD':
      default:
        return 'en-US';
    }
  }

  listCards() {
    this.cardsService.getAllCards().subscribe({
      next: (response: any) => {
        const cardsArray = response.cards as any[];

        this.cards = cardsArray.map((card) => ({
          ...card,
          status: Number(card.status), // Garante que o status seja um número
        }));

        console.log('Cards loaded:', this.cards);
      },
      error: (err) => {
        console.error('Failed to load cards:', err);
      },
    });
  }
}
