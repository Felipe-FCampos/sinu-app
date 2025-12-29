import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, CardsService } from 'src/app/services/cards.service';

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
