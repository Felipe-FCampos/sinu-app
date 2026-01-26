import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData, } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de';
import { CreateSubscriptionPayload, SubscriptionsService } from 'src/app/services/subscriptions.service';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../currency-mask.directive';
import { Card, CardsService } from 'src/app/services/cards.service';
import { FilterComponent } from '../filter/filter.component';

registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeDe, 'de-DE');

export enum SubscriptionStatus {
  Disabled = 0,
  Active = 1,
  Expiring = 2,
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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyMaskDirective,
    FilterComponent
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private cardsService: CardsService
  ) { }

  public isLoading = true;

  editingSubscriptionId: string | null = null;

  subscriptions: Subscription[] = [];
  private allSubscriptions: Subscription[] = [];

  isUpdateMode: boolean = false;
  isSortedByNextPayment = false;

  public statusFilterOptions = [
    { label: 'Ativo', value: SubscriptionStatus.Active },
    { label: 'À vencer', value: SubscriptionStatus.Expiring },
    { label: 'Vencido', value: SubscriptionStatus.Expired },
    { label: 'Desativado', value: SubscriptionStatus.Disabled }
  ];
  private activeStatusFilters: SubscriptionStatus[] = [];

  public subscriptionTypes = [
    { value: 'STREAMING', label: 'Streaming' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'GAMING', label: 'Jogos' },
    { value: 'RENT', label: 'Aluguel' },
    { value: 'BILL', label: 'Contas e Utilitários' },
    { value: 'MUSIC', label: 'Música' },
    { value: 'NEWS', label: 'Notícias e Revistas' },
    { value: 'EDUCATION', label: 'Educação' },
    { value: 'FITNESS', label: 'Fitness e Saúde' },
    { value: 'OTHER', label: 'Outros' }
  ];

  isSubmitting = false;
  showSuccess = false;
  showUpdateSuccess = false;
  showDeleteSuccess = false;
  showPaymentSuccess = false;

  days: number[] = Array.from({ length: 30 }, (_, i) => i + 1);

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

  public availableCards: Card[] = [];
  public showManualCardInput = false;

  public bankList = [
    'Banco do Brasil', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 
    'Banco Inter', 'PicPay', 'Nubank', 'C6 Bank', 'Outro'
  ];

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
    this.loadInitialData();
  }

  loadInitialData() {
    this.listSubscriptions();
    this.loadAvailableCards();
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

  public convertTimestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  getStatusLabel(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.Active: return 'Ativo';
      case SubscriptionStatus.Expiring: return 'À vencer';
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
    this.resetNewSubscription();
  }

  closeAddSubscriptionForm() {
    const forms = document.querySelector('.add-subscription-section') as HTMLElement;
    const div = document.querySelector('.div_background_modal') as HTMLElement;
    div.style.display = 'none';
    forms.style.display = 'none';
    this.isSubmitting = false;
    this.resetNewSubscription();
  }

  openUpdateSubscriptionForm(subscription: Subscription) {
    this.editingSubscriptionId = subscription.id;
    this.newSubscription = { ...subscription };

    const cardExists = this.availableCards.some(c => c.cardFinalNumbers === subscription.cardFinalNumbers);
    if ((subscription.paymentMethod === 'CREDIT_CARD' || subscription.paymentMethod === 'DEBIT_CARD') && !cardExists) {
      this.showManualCardInput = true;
    } else {
      this.showManualCardInput = false;
    }

    this.isUpdateMode = true;
    const modal = document.querySelector('.update-subscription-section') as HTMLElement;
    const div = document.querySelector('.div_background_modal') as HTMLElement;
    div.style.display = 'block';
    modal.style.display = 'block';
  }

  closeUpdateSubscriptionForm() {
    const forms = document.querySelector('.update-subscription-section') as HTMLElement;
    const div = document.querySelector('.div_background_modal') as HTMLElement;
    div.style.display = 'none';
    forms.style.display = 'none';
    this.isSubmitting = false;
    this.editingSubscriptionId = null;
    this.resetNewSubscription();
  }

  calculateNextPayment(createdDate: Date, billingDay: number, billingFrequency: string): Date {
    const paymentDate = new Date(createdDate);

    paymentDate.setDate(billingDay);

    if (paymentDate <= createdDate) {
      switch (billingFrequency) {
        case 'MONTHLY':
          paymentDate.setMonth(paymentDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          paymentDate.setMonth(paymentDate.getMonth() + 3);
          break;
        case 'SEMESTRAL':
          paymentDate.setMonth(paymentDate.getMonth() + 6);
          break;
        case 'ANNUAL':
          paymentDate.setFullYear(paymentDate.getFullYear() + 1);
          break;
        default:
          paymentDate.setMonth(paymentDate.getMonth() + 1);
          break;
      }
    }

    return paymentDate;
  }

  listSubscriptions() {
    this.isLoading = true;
    this.subscriptionsService.getAllSubscriptions().subscribe((data: any) => {
      const arr = data as any[];
      this.allSubscriptions = arr.map(sub => ({
        ...sub,
        status: Number(sub.status) as SubscriptionStatus,
      }));
      this.subscriptions = [...this.allSubscriptions];
      this.applyFilters();
      console.log('Subscriptions: ', this.subscriptions);
      this.isLoading = false;
    });
  }

  applyFilters() {
    let filteredSubscriptions = [...this.allSubscriptions];

    if (this.activeStatusFilters.length > 0) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => 
        this.activeStatusFilters.includes(sub.status)
      );
    }
    
    this.subscriptions = filteredSubscriptions;

    if (this.isSortedByNextPayment) {
      this.subscriptions.sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime());
    }
  }

  toggleSortByNextPayment() {
    this.isSortedByNextPayment = !this.isSortedByNextPayment;
    this.applyFilters();
  }

  onStatusFilterChange(selectedStatuses: SubscriptionStatus[]) {
    this.activeStatusFilters = selectedStatuses;
    this.applyFilters();
  }

  filterSubscriptions(searchTerm: string) {
    if (!searchTerm) {
      this.subscriptions = [...this.allSubscriptions];
      this.applyFilters();
    } else {
      this.applyFilters();
      this.subscriptions = this.subscriptions.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  addSubscription() {
    const createdDate = new Date(this.newSubscription.createdDate);
    const billingDay = this.newSubscription.billingDay;
    const billingFrequency = this.newSubscription.billingFrequency;

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

    this.isSubmitting = true;
    this.showSuccess = false;

    this.subscriptionsService.addSubscription(newSubscription).subscribe({
      next: (response) => {
        console.log('Subscription added:', response);
        this.listSubscriptions();
        this.resetNewSubscription();
        this.isSubmitting = false;
        this.showSuccess = true;
        this.closeAddSubscriptionForm();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  updateSubscription() {
    if (!this.editingSubscriptionId) {
      console.error('Nenhuma assinatura selecionada para edição.');
      return;
    }

    const createdDate = new Date(this.newSubscription.createdDate);
    const billingDay = this.newSubscription.billingDay;
    const billingFrequency = this.newSubscription.billingFrequency;

    if (billingDay === null) return;

    const nextPayment = this.calculateNextPayment(createdDate, billingDay, billingFrequency);

    const updatePayload = {
      name: this.newSubscription.name,
      description: '',
      price: this.newSubscription.price,
      currency: this.newSubscription.currency,
      subscriptionType: this.newSubscription.subscriptionType,
      billingDay: billingDay,
      billingFrequency: billingFrequency,
      nextPayment: nextPayment.toISOString(),
      paymentMethod: this.newSubscription.paymentMethod,
      status: this.newSubscription.status,
      cardBank: this.newSubscription.cardBank || null,
      cardFinalNumbers: this.newSubscription.cardFinalNumbers || null,
    };

    this.isSubmitting = true;

    this.subscriptionsService
      .updateSubscription(this.editingSubscriptionId, updatePayload)
      .subscribe({
        next: (updated) => {
          this.subscriptions = this.subscriptions.map(s =>
            s.id === updated.id ? updated : s
          );

          this.listSubscriptions();
          this.isSubmitting = false;
          this.closeUpdateSubscriptionForm();
          this.showUpdateSuccess = true;
        },
        error: (err) => {
          console.error('Erro ao atualizar assinatura', err);
          this.isSubmitting = false;
        }
      });
  }


  deleteSubscription(subscriptionId: string) {
    if (!subscriptionId) {
      console.error('ID da assinatura não fornecido para exclusão.');
      return;
    }

    const subscriptionToDelete = this.subscriptions.find(s => s.id === subscriptionId);
    const subscriptionName = subscriptionToDelete ? subscriptionToDelete.name : 'esta assinatura';

    const confirmed = confirm(`Deseja realmente excluir "${subscriptionName}"?`);
    if (!confirmed) return;

    this.isSubmitting = true;

    this.subscriptionsService.deleteSubscription(subscriptionId).subscribe({
      next: () => {
        this.subscriptions = this.subscriptions.filter(
          (s) => s.id !== subscriptionId
        );
        this.isSubmitting = false;
        this.closeUpdateSubscriptionForm();
        this.showDeleteSuccess = true;
      },
      error: (err) => {
        console.error('Erro ao deletar assinatura', err);
        this.isSubmitting = false;
        alert('Ocorreu um erro ao apagar a assinatura.');
      }
    });
  }

  paySubscription(subscription: Subscription) {
    this.subscriptionsService.paySubscription(subscription).subscribe({
      next: (response) => {
        this.showPaymentSuccess = true;
        this.listSubscriptions();
      },
      error: (err) => {
        alert(`Erro ao processar o pagamento: ${err.message || 'Tente novamente.'}`);
      }
    });
  }

  onCardSelectionChange(selectedValue: string) {
    if (selectedValue === 'manual') {
      this.showManualCardInput = true;
      this.newSubscription.cardFinalNumbers = '';
      this.newSubscription.cardBank = '';
    } else {
      this.showManualCardInput = false;
      const selectedCard = this.availableCards.find(c => c.cardFinalNumbers === selectedValue);
      if (selectedCard) {
        this.newSubscription.cardBank = selectedCard.cardBank;
        this.newSubscription.cardFinalNumbers = selectedCard.cardFinalNumbers;
      }
    }
  }

  loadAvailableCards() {
    this.cardsService.getAllCards().subscribe({
      next: (response) => {
        this.availableCards = response.cards;
      },
      error: (err) => {
        console.error('Erro ao buscar cartões:', err);
      }
    });
  }
}