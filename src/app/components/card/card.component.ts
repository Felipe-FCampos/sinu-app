import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Card, CardsService, CreateCardPayload, UpdateCardPayload } from 'src/app/services/cards.service';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../currency-mask.directive';
import { RouterLink } from '@angular/router';

registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective, RouterLink],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  cards: Card[] = [];
  editingCardId: string | null = null;

  // Estados de UI
  isSubmitting = false;
  showAddSuccess = false;
  showUpdateSuccess = false;
  showDeleteSuccess = false;

  // Dados do formulário
  newCard: CreateCardPayload = {
    cardName: '',
    limit: 0,
    cardBank: 'Selecione um banco',
    cardFinalNumbers: '',
    dueDate: null,
    closeDay: null,
    status: 1,
  };

  // Opções para selects
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  banks: string[] = [
    'Selecione um banco',
    'Banco do Brasil', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 
    'Banco Inter', 'PicPay', 'Nubank', 'C6 Bank', 'Outro'
  ];

  constructor(private cardsService: CardsService) { }

  ngOnInit() {
    this.listCards();
  }

  resetNewCard() {
    this.newCard = {
      cardName: '',
      limit: 0,
      cardBank: 'Selecione um banco',
      cardFinalNumbers: '',
      dueDate: null,
      closeDay: null,
      status: 1,
    };
  }

  // --- Controle dos Modais de Formulário ---
  openAddCardForm() {
    this.resetNewCard();
    const form = document.querySelector('.add-card-section') as HTMLElement;
    const bg = document.querySelector('.div_background_modal') as HTMLElement;
    if (form && bg) {
      bg.style.display = 'block';
      form.style.display = 'block';
    }
  }

  closeAddCardForm() {
    const form = document.querySelector('.add-card-section') as HTMLElement;
    const bg = document.querySelector('.div_background_modal') as HTMLElement;
    if (form && bg) {
      bg.style.display = 'none';
      form.style.display = 'none';
    }
    this.isSubmitting = false;
  }

  openUpdateCardForm(card: Card) {
    this.editingCardId = card.id;
    this.newCard = {
      cardName: card.cardName,
      limit: card.limit,
      cardBank: card.cardBank,
      cardFinalNumbers: card.cardFinalNumbers,
      dueDate: card.dueDate,
      closeDay: card.closeDay,
      status: card.status,
    };
    const form = document.querySelector('.update-card-section') as HTMLElement;
    const bg = document.querySelector('.div_background_modal') as HTMLElement;
    if (form && bg) {
      bg.style.display = 'block';
      form.style.display = 'block';
    }
  }

  closeUpdateCardForm() {
    const form = document.querySelector('.update-card-section') as HTMLElement;
    const bg = document.querySelector('.div_background_modal') as HTMLElement;
    if (form && bg) {
      bg.style.display = 'none';
      form.style.display = 'none';
    }
    this.editingCardId = null;
    this.isSubmitting = false;
    this.resetNewCard();
  }

  // --- Funções CRUD ---
  listCards() {
    this.cardsService.getAllCards().subscribe({
      next: (response) => {
        this.cards = response.cards.map((card) => ({
          ...card,
          status: Number(card.status),
        }));
      },
      error: (err) => console.error('Failed to load cards:', err),
    });
  }

  addCard() {
    if (!this.newCard.dueDate || this.newCard.cardBank === 'Selecione um banco') {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    this.isSubmitting = true;

    // Cria o payload sem o totalSpent, pois o backend calcula
    const payload: CreateCardPayload = {
      cardName: this.newCard.cardName,
      limit: this.newCard.limit,
      cardBank: this.newCard.cardBank,
      cardFinalNumbers: this.newCard.cardFinalNumbers,
      dueDate: this.newCard.dueDate,
      closeDay: this.newCard.closeDay,
      status: this.newCard.status,
    };

    this.cardsService.addCard(payload).subscribe({
      next: () => {
        this.listCards();
        this.closeAddCardForm();
        this.showAddSuccess = true;
      },
      error: (err) => {
        console.error('Error adding card:', err);
        this.isSubmitting = false;
      },
    });
  }

  updateCard() {
    if (!this.editingCardId) {
      console.error('Nenhum cartão selecionado para edição.');
      return;
    }

    // Validação para garantir que campos obrigatórios foram preenchidos
    if (!this.newCard.dueDate || this.newCard.cardBank === 'Selecione um banco') {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Cria o payload explicitamente, garantindo a estrutura correta
    const payload: UpdateCardPayload = {
      cardName: this.newCard.cardName,
      limit: this.newCard.limit,
      cardBank: this.newCard.cardBank,
      cardFinalNumbers: this.newCard.cardFinalNumbers,
      dueDate: this.newCard.dueDate,
      closeDay: this.newCard.closeDay,
      status: this.newCard.status,
    };

    this.isSubmitting = true;
    this.cardsService.updateCard(this.editingCardId, payload).subscribe({
      next: (updatedCard) => {
        // Opcional: Atualiza o cartão na lista local sem refazer a chamada de API
        const index = this.cards.findIndex(c => c.id === this.editingCardId);
        if (index !== -1) {
          this.cards[index] = { ...this.cards[index], ...updatedCard };
        }
        
        this.listCards(); // Ou simplesmente recarrega a lista
        this.closeUpdateCardForm();
        this.showUpdateSuccess = true;
      },
      error: (err) => {
        console.error('Error updating card:', err);
        this.isSubmitting = false;
      },
    });
  }

  deleteCard(cardId: string) {
    if (!cardId) return;
    const confirmed = confirm('Deseja realmente excluir este cartão?');
    if (!confirmed) return;

    this.isSubmitting = true;
    this.cardsService.deleteCard(cardId).subscribe({
      next: () => {
        this.cards = this.cards.filter((c) => c.id !== cardId);
        this.closeUpdateCardForm();
        this.showDeleteSuccess = true;
      },
      error: (err) => {
        console.error('Error deleting card:', err);
        this.isSubmitting = false;
      },
    });
  }

  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL': return 'pt-BR';
      case 'EUR': return 'de-DE';
      case 'USD': default: return 'en-US';
    }
  }
}
