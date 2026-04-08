import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card, CardsService, CreateStandalonePaymentPayload, StandalonePayment } from 'src/app/services/cards.service';
import { CurrencyMaskDirective } from '../../currency-mask.directive';
import { FilterComponent } from '../filter/filter.component';

export interface GroupedPayments {
  monthYear: string;
  payments: StandalonePayment[];
}

@Component({
  selector: 'app-sap',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective, FilterComponent],
  templateUrl: './sap.component.html',
  styleUrls: ['./sap.component.scss'],
})
export class SapComponent implements OnInit {
  public isLoading = true;
  allPayments: StandalonePayment[] = [];
  filteredPayments: StandalonePayment[] = [];
  groupedPayments: { monthYear: string, payments: StandalonePayment[] }[] = [];
  public availableCards: Card[] = [];

  public showAddPaymentModal = false;
  public isSubmitting = false;
  public showSuccessModal = false;
  public showManualCardInput = false;

  public showUpdatePaymentModal = false;
  public showUpdateSuccessModal = false;
  public showDeleteSuccessModal = false;
  public editingPaymentId: string | null = null;

  public bankList = [
    'Banco do Brasil', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander',
    'Banco Inter', 'PicPay', 'Nubank', 'C6 Bank', 'Outro'
  ];

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

  public newPayment: Partial<CreateStandalonePaymentPayload> = {
    title: '',
    price: 0,
    category: 'Outros',
    paymentMethod: 'CREDIT_CARD',
    installments: 1,
    cardBank: '',
    cardFinalNumbers: '',
    purchaseDate: '',
    description: ''
  };

  constructor(private sapService: CardsService) { }

  // ngOnInit
  ngOnInit(): void {
    this.loadInitialData();
  }

  // loadInitialData
  loadInitialData(): void {
    this.isLoading = true;
    this.sapService.getAllStandalonePayments().subscribe(payments => {
      this.allPayments = payments;
      this.loadAvailableCards();
      this.filterPayments('');
      this.isLoading = false;
    });
  }

  // filterPayments
  filterPayments(searchTerm: string) {
    const term = searchTerm.toLowerCase();
    if (!term) {
      this.filteredPayments = [...this.allPayments];
    } else {
      this.filteredPayments = this.allPayments.filter(payment =>
        payment.title.toLowerCase().includes(term)
      );
    }
    this.groupPaymentsByMonth();
  }

  // loadAvailableCards
  loadAvailableCards() {
    this.sapService.getAllCards().subscribe({
      next: (res: { cards: Card[] }) => {
        this.availableCards = res.cards;
      },
      error: (err) => {
        console.error('Erro ao buscar cartões:', err);
      }
    });
  }

  // openAddPaymentForm
  openAddPaymentForm() {
    this.resetForm();
    this.showAddPaymentModal = true;
  }

  // closeAddPaymentForm
  closeAddPaymentForm() {
    this.showAddPaymentModal = false;
    this.resetForm();
  }

  // openUpdatePaymentForm
  openUpdatePaymentForm(payment: StandalonePayment) {
    this.editingPaymentId = payment.id;
    this.newPayment = {
      ...payment,
      price: payment.price / 100,
      purchaseDate: new Date(payment.purchaseDate).toISOString().split('T')[0]
    };

    if (this.newPayment.paymentMethod === 'CREDIT_CARD' || this.newPayment.paymentMethod === 'DEBIT_CARD') {
      const cardExists = this.availableCards.some(c => c.cardFinalNumbers === payment.cardFinalNumbers);
      this.showManualCardInput = !cardExists;
    } else {
      this.showManualCardInput = false;
    }

    this.showUpdatePaymentModal = true;
  }

  // closeUpdatePaymentForm
  closeUpdatePaymentForm() {
    this.showUpdatePaymentModal = false;
    this.editingPaymentId = null;
    this.isSubmitting = false;
    this.resetForm();
  }

  // addStandalonePayment
  addStandalonePayment() {
    const needsCard = this.newPayment.paymentMethod === 'CREDIT_CARD' || this.newPayment.paymentMethod === 'DEBIT_CARD';

    if (needsCard && !this.newPayment.cardFinalNumbers) {
      alert('Por favor, selecione um cartão.');
      return;
    }

    this.isSubmitting = true;

    if (!needsCard) {
      this.newPayment.cardBank = '';
      this.newPayment.cardFinalNumbers = '';
    } else {
      const selectedCard = this.availableCards.find(c => c.cardFinalNumbers === this.newPayment.cardFinalNumbers);
      if (selectedCard) {
        this.newPayment.cardBank = selectedCard.cardBank;
      }
    }

    this.sapService.addStandalonePayment(this.newPayment as CreateStandalonePaymentPayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddPaymentForm();
        this.showSuccessModal = true;
        this.loadInitialData();
      },
      error: (err) => {
        console.error('Erro ao adicionar pagamento:', err);
        this.isSubmitting = false;
      }
    });
  }

  // updateStandalonePayment
  updateStandalonePayment() {
    if (!this.editingPaymentId) return;

    const needsCard = this.newPayment.paymentMethod === 'CREDIT_CARD' || this.newPayment.paymentMethod === 'DEBIT_CARD';
    if (!needsCard) {
      this.newPayment.cardBank = '';
      this.newPayment.cardFinalNumbers = '';
    }

    this.isSubmitting = true;
    this.sapService.updateStandalonePayment(this.editingPaymentId, this.newPayment).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeUpdatePaymentForm();
        this.showUpdateSuccessModal = true;
        this.loadInitialData();
      },
      error: (err) => {
        console.error('Erro ao atualizar pagamento:', err);
        this.isSubmitting = false;
      }
    });
  }

  // deleteStandalonePayment
  deleteStandalonePayment(paymentId: string) {
    if (!paymentId) return;
    const paymentToDelete = this.allPayments.find(p => p.id === paymentId);
    const paymentTitle = paymentToDelete ? paymentToDelete.title : 'este pagamento';

    if (confirm(`Tem certeza que deseja apagar "${paymentTitle}"?`)) {
      this.isSubmitting = true;
      this.sapService.deleteStandalonePayment(paymentId).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeUpdatePaymentForm();
          this.showDeleteSuccessModal = true;
          this.loadInitialData();
        },
        error: (err) => {
          console.error('Erro ao apagar pagamento:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  // closeSuccessModal
  closeSuccessModal() {
    this.showSuccessModal = false;
    this.showUpdateSuccessModal = false;
    this.showDeleteSuccessModal = false;
  }

  // resetForm
  private resetForm() {
    this.newPayment = {
      title: '',
      price: 0,
      category: 'Outros',
      paymentMethod: 'CREDIT_CARD',
      installments: 1,
      cardBank: '',
      cardFinalNumbers: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.showManualCardInput = false;
  }

  // groupPaymentsByMonth
  private groupPaymentsByMonth() {
    const groups = new Map<string, StandalonePayment[]>();

    for (const payment of this.filteredPayments) {
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

  // onCardSelectionChange
  onCardSelectionChange(selectedValue: string) {
    if (selectedValue === 'manual') {
      this.showManualCardInput = true;
      this.newPayment.cardFinalNumbers = '';
      this.newPayment.cardBank = '';
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