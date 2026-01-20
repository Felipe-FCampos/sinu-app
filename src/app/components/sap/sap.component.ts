import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card, CardsService, CreateStandalonePaymentPayload, StandalonePayment } from 'src/app/services/cards.service';
import { CurrencyMaskDirective } from '../../currency-mask.directive';

// Nova interface para a estrutura agrupada
export interface GroupedPayments {
  monthYear: string;
  payments: StandalonePayment[];
}

@Component({
  selector: 'app-sap',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  templateUrl: './sap.component.html',
  styleUrls: ['./sap.component.scss'],
})
export class SapComponent implements OnInit {
  private standAlonePayments: StandalonePayment[] = [];
  public groupedPayments: GroupedPayments[] = [];
  public availableCards: Card[] = [];

  public showAddPaymentModal = false;
  public isSubmitting = false;
  public showSuccessModal = false;
  public showManualCardInput = false;

  // 1. Adicionar a lista de bancos
  public bankList = [
    'Banco do Brasil', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 
    'Banco Inter', 'PicPay', 'Nubank', 'C6 Bank', 'Outro'
  ];

  // --- 3. Lista de categorias pré-definidas ---
  public paymentCategories = [
    { value: 'Alimentação', label: 'Alimentação' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Moradia', label: 'Moradia' },
    { value: 'Lazer', label: 'Lazer' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Compras', label: 'Compras' },
    { value: 'Serviços', label: 'Serviços' },
    { value: 'Outros', label: 'Outros' },
  ];

  // Objeto para vincular os dados do formulário
  public newPayment: Partial<CreateStandalonePaymentPayload> = {
    title: '',
    price: 0,
    category: 'Outros', // <-- Valor padrão
    installments: 1,
    cardBank: '', // Será preenchido dinamicamente
    cardFinalNumbers: '',
    purchaseDate: '',
    description: ''
  };

  constructor( private sapService: CardsService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.listStandAlonePayments();
    this.loadAvailableCards();
  }

  listStandAlonePayments() {
    this.sapService.getAllStandalonePayments().subscribe({
      next: (response) => {
        this.standAlonePayments = response;
        this.groupPaymentsByMonth();
      },
      error: (err) => {
        console.error('Erro ao buscar pagamentos avulsos:', err);
        this.standAlonePayments = [];
        this.groupedPayments = [];
      }
    });
  }

  loadAvailableCards() {
    this.sapService.getAllCards().subscribe({
      next: (response) => {
        this.availableCards = response.cards;
      },
      error: (err) => {
        console.error('Erro ao buscar cartões:', err);
      }
    });
  }

  // --- 4. Métodos para o formulário ---

  openAddPaymentForm() {
    this.resetForm();
    this.showAddPaymentModal = true;
  }

  closeAddPaymentForm() {
    this.showAddPaymentModal = false;
  }

  addStandalonePayment() {
    if (!this.newPayment.cardFinalNumbers) {
      alert('Por favor, selecione um cartão.');
      return;
    }
    this.isSubmitting = true;

    // Encontra o banco do cartão selecionado
    const selectedCard = this.availableCards.find(c => c.cardFinalNumbers === this.newPayment.cardFinalNumbers);
    if (selectedCard) {
      this.newPayment.cardBank = selectedCard.cardBank;
    }

    this.sapService.addStandalonePayment(this.newPayment as CreateStandalonePaymentPayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddPaymentForm();
        this.showSuccessModal = true;
        this.loadInitialData(); // Recarrega os dados
      },
      error: (err) => {
        console.error('Erro ao adicionar pagamento:', err);
        this.isSubmitting = false;
        alert('Falha ao adicionar pagamento. Verifique os dados e tente novamente.');
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  private resetForm() {
    this.newPayment = {
      title: '',
      price: 0,
      category: '',
      installments: 1,
      cardBank: '',
      cardFinalNumbers: '',
      purchaseDate: new Date().toISOString().split('T')[0], // Preenche com a data de hoje
      description: ''
    };
  }

  private groupPaymentsByMonth() {
    const groups = new Map<string, StandalonePayment[]>();

    for (const payment of this.standAlonePayments) {
      const date = new Date(payment.purchaseDate);
      const monthYearKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!groups.has(monthYearKey)) {
        groups.set(monthYearKey, []);
      }
      groups.get(monthYearKey)!.push(payment);
    }

    this.groupedPayments = Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, payments]) => {
        const [year, month] = key.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
        
        payments.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

        return {
          monthYear: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`,
          payments: payments
        };
      });
  }

  // Adicionar este método
  onCardSelectionChange(selectedValue: string) {
    if (selectedValue === 'manual') {
      this.showManualCardInput = true;
      this.newPayment.cardFinalNumbers = '';
      this.newPayment.cardBank = ''; // Limpa para nova seleção
    } else {
      this.showManualCardInput = false;
      const selectedCard = this.availableCards.find(c => c.cardFinalNumbers === selectedValue);
      if (selectedCard) {
        this.newPayment.cardBank = selectedCard.cardBank;
        this.newPayment.cardFinalNumbers = selectedCard.cardFinalNumbers;
      }
    }
  }
}
