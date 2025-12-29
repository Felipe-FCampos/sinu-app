import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData, } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import localePt from '@angular/common/locales/pt';
import localeDe from '@angular/common/locales/de'; // Exemplo se você mapear 'EUR' para 'de-DE'
import { CreateSubscriptionPayload, SubscriptionsService } from 'src/app/services/subscriptions.service';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../currency-mask.directive'; // 1. Importe a diretiva

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
    CurrencyMaskDirective
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {

  constructor(private subscriptionsService: SubscriptionsService) { }

  editingSubscriptionId: string | null = null;

  subscriptions: Subscription[] = [];

  // ADICIONE ESTA PROPRIEDADE
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

  isSubmitting = false;   // 👈 loader
  showSuccess = false;    // 👈 modal de sucesso para ADIÇÃO
  showUpdateSuccess = false; // 👈 modal de sucesso para ATUALIZAÇÃO
  showDeleteSuccess = false; // 👈 modal de sucesso para EXCLUSÃO
  showPaymentSuccess = false; // 👈 modal para pagamento

  days: number[] = Array.from({ length: 30 }, (_, i) => i + 1); // Gera os dias de 1 a 30

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
    this.listSubscriptions();
  }

  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL':
        return 'pt-BR';
      case 'EUR': // Geralmente Europa usa vírgula decimal
        return 'de-DE';
      case 'USD':
      case 'AUD':
        return 'en-US'; // Geralmente padrão anglófono (ponto decimal)
      default:
        // Padrão de segurança: use o localizador do seu país ou o padrão internacional
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

  // Open and close subscription form for adding a new subscription

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

  // Open and close subscription form for updating a new subscription

  openUpdateSubscriptionForm(subscription: Subscription) {
    this.editingSubscriptionId = subscription.id;

    this.newSubscription = {
      name: subscription.name,
      description: subscription.description,
      price: subscription.price,
      currency: subscription.currency,
      subscriptionType: subscription.subscriptionType,
      billingDay: subscription.billingDay,
      billingFrequency: subscription.billingFrequency,
      createdDate: subscription.createdDate,          // mantém a original
      nextPayment: subscription.nextPayment,
      paymentMethod: subscription.paymentMethod,
      status: subscription.status,
      cardBank: subscription.cardBank ?? null,
      cardFinalNumbers: subscription.cardFinalNumbers ?? ''
    };

    const forms = document.querySelector('.update-subscription-section') as HTMLElement;
    const div = document.querySelector('.div_background_modal') as HTMLElement;
    div.style.display = 'block';
    forms.style.display = 'block';
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
    // Cria uma cópia da data de criação para não modificar a original
    const paymentDate = new Date(createdDate);

    // Define o dia do mês para o dia de cobrança escolhido
    paymentDate.setDate(billingDay);

    // Se a data de pagamento calculada (neste mês) já passou ou é hoje,
    // precisamos avançar para o próximo ciclo de cobrança.
    if (paymentDate <= createdDate) {
      // Avança para o próximo ciclo baseado na frequência
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
          // Como padrão, avança um mês se a frequência for desconhecida
          paymentDate.setMonth(paymentDate.getMonth() + 1);
          break;
      }
    }
    // Se a data de pagamento (paymentDate) for futura, não fazemos nada,
    // pois ela já é a data correta da próxima cobrança.

    return paymentDate;
  }

  // CRUD Functions -------------------------------------------

  listSubscriptions() {
    this.subscriptionsService.getAllSubscriptions().subscribe((data: any) => {
      const arr = data as any[];
      this.subscriptions = arr.map(sub => ({
        ...sub,
        status: Number(sub.status) as SubscriptionStatus,
      }));
      console.log('Subscriptions: ', this.subscriptions);
    });
  }

  addSubscription() {
    const createdDate = new Date(this.newSubscription.createdDate);
    const billingDay = this.newSubscription.billingDay;
    const billingFrequency = this.newSubscription.billingFrequency;

    // Calcula a data do próximo pagamento
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

    this.isSubmitting = true;    // 👈 começa o loader
    this.showSuccess = false;

    this.subscriptionsService.addSubscription(newSubscription).subscribe({
      next: (response) => {
        console.log('Subscription added:', response);
        this.listSubscriptions(); // Refresh the list after adding
        this.resetNewSubscription();
        this.isSubmitting = false;   // 👈 para loader
        this.showSuccess = true;
        this.closeAddSubscriptionForm();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;   // garante que não fique travado
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
          // Atualiza a lista local
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

    this.isSubmitting = true; // Ativa o loader

    this.subscriptionsService.deleteSubscription(subscriptionId).subscribe({
      next: () => {
        // Remove a assinatura da lista local para atualizar a UI
        this.subscriptions = this.subscriptions.filter(
          (s) => s.id !== subscriptionId
        );
        this.isSubmitting = false; // Para o loader
        this.closeUpdateSubscriptionForm(); // Fecha o modal de EDIÇÃO
        this.showDeleteSuccess = true; // Mostra o modal de exclusão com sucesso
      },
      error: (err) => {
        console.error('Erro ao deletar assinatura', err);
        this.isSubmitting = false; // Garante que o loader pare em caso de erro
        alert('Ocorreu um erro ao apagar a assinatura.');
      }
    });
  }

  paySubscription(subscription: Subscription) {
    this.subscriptionsService.paySubscription(subscription).subscribe({
      next: (response) => {
        this.showPaymentSuccess = true; // Mostra o modal de sucesso
        this.listSubscriptions(); // Refresh the list after payment
      },
      error: (err) => {
        // Mantive o alert para o erro, mas você pode criar um modal de erro também
        alert(`Erro ao processar o pagamento: ${err.message || 'Tente novamente.'}`);
      }
    });
  }
}