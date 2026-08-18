
import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../currency-mask.directive';
import { FilterComponent } from '../filter/filter.component';
import {
  Investment,
  InvestmentsService,
  CreateInvestmentPayload,
  AddTransactionPayload,
} from 'src/app/services/investments.service';

registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyMaskDirective,
    FilterComponent
  ],
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss']
})
export class InvestmentsComponent implements OnInit {
  selectedInvestmentForHistory: Investment | null = null;

  constructor(private investmentsService: InvestmentsService) { }

  public isLoading = true;
  public isSubmitting = false;

  public showSuccess = false;
  public showUpdateSuccess = false;
  public showDeleteSuccess = false;
  public showTransactionSuccess = false;

  public investments: Investment[] = [];
  private allInvestments: Investment[] = [];

  public editingInvestmentId: string | null = null;
  public selectedInvestmentForTransaction: Investment | null = null;

  public isSortedByValue = false;
  public activeStatusFilters: string[] = [];

  public statusFilterOptions = [
    { label: 'Ativo', value: 'active' },
    { label: 'Resgatado', value: 'redeemed' }
  ];

  public investmentTypes = [
    { value: 'CDB', label: 'CDB' },
    { value: 'LCI', label: 'LCI' },
    { value: 'LCA', label: 'LCA' },
    { value: 'TESOURO_DIRETO', label: 'Tesouro Direto' },
    { value: 'ACOES', label: 'Ações' },
    { value: 'FIIS', label: 'FIIs (Fundos Imobiliários)' },
    { value: 'CRIPTO', label: 'Criptomoedas' },
    { value: 'OUTROS', label: 'Outros' }
  ];

  public newInvestment: CreateInvestmentPayload = {
    name: '',
    investment_type: 'CDB',
    initial_value: 0,
    cdi_percentage: null,
    status: 'active',
    notes: ''
  };

  public transactionPayload: AddTransactionPayload = {
    amount: 0,
    note: ''
  };

  ngOnInit() {
    this.listInvestments();
  }

  resetNewInvestment() {
    this.newInvestment = {
      name: '',
      investment_type: 'CDB',
      initial_value: 0,
      cdi_percentage: null,
      status: 'active',
      notes: ''
    };
  }

  resetTransactionPayload() {
    this.transactionPayload = {
      amount: 0,
      note: ''
    };
  }

  listInvestments() {
    this.isLoading = true;
    this.investmentsService.getAllInvestments().subscribe({
      next: (response) => {
        this.allInvestments = response.investments || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar investimentos:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allInvestments];

    if (this.activeStatusFilters.length > 0) {
      filtered = filtered.filter(inv => this.activeStatusFilters.includes(inv.status));
    }

    this.investments = filtered;

    if (this.isSortedByValue) {
      this.investments.sort((a, b) => b.final_value - a.final_value);
    }
  }

  toggleSortByValue() {
    this.isSortedByValue = !this.isSortedByValue;
    this.applyFilters();
  }

  onStatusFilterChange(selectedStatuses: string[]) {
    this.activeStatusFilters = selectedStatuses;
    this.applyFilters();
  }

  filterInvestments(searchTerm: string) {
    if (!searchTerm) {
      this.applyFilters();
    } else {
      this.applyFilters();
      this.investments = this.investments.filter(inv =>
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.investment_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Ativo';
      case 'redeemed': return 'Resgatado';
      default: return status || 'Desconhecido';
    }
  }

  getTypeLabel(type: string): string {
    const found = this.investmentTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  // --- Modal: Adicionar ---
  openAddInvestmentForm() {
    const form = document.querySelector('.add-investment-section') as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (backdrop) backdrop.style.display = 'block';
    if (form) form.style.display = 'block';
    this.resetNewInvestment();
  }

  closeAddInvestmentForm() {
    const form = document.querySelector('.add-investment-section') as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (backdrop) backdrop.style.display = 'none';
    if (form) form.style.display = 'none';
    this.isSubmitting = false;
    this.resetNewInvestment();
  }

  addInvestment() {
    this.isSubmitting = true;
    this.showSuccess = false;

    this.investmentsService.addInvestment(this.newInvestment).subscribe({
      next: () => {
        this.listInvestments();
        this.isSubmitting = false;
        this.showSuccess = true;
        this.closeAddInvestmentForm();
      },
      error: (err) => {
        console.error('Erro ao criar investimento:', err);
        this.isSubmitting = false;
      }
    });
  }

  // --- Modal: Editar ---
  openUpdateInvestmentForm(investment: Investment) {
    this.editingInvestmentId = investment.id;
    this.selectedInvestmentForHistory = investment;
    this.newInvestment = {
      name: investment.name,
      investment_type: investment.investment_type,
      initial_value: investment.final_value,
      cdi_percentage: investment.cdi_percentage,
      status: investment.status,
      notes: investment.notes
    };

    const modal = document.querySelector('.update-investment-section') as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (backdrop) backdrop.style.display = 'block';
    if (modal) modal.style.display = 'block';
  }

  closeUpdateInvestmentForm() {
    const modal = document.querySelector('.update-investment-section') as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (backdrop) backdrop.style.display = 'none';
    if (modal) modal.style.display = 'none';
    this.isSubmitting = false;
    this.editingInvestmentId = null;
    this.resetNewInvestment();
  }

  updateInvestment() {
    if (!this.editingInvestmentId) return;

    this.isSubmitting = true;

    const payload = {
      name: this.newInvestment.name,
      investment_type: this.newInvestment.investment_type,
      cdi_percentage: this.newInvestment.cdi_percentage,
      status: this.newInvestment.status,
      notes: this.newInvestment.notes
    };

    this.investmentsService.updateInvestment(this.editingInvestmentId, payload).subscribe({
      next: () => {
        this.listInvestments();
        this.isSubmitting = false;
        this.closeUpdateInvestmentForm();
        this.showUpdateSuccess = true;
      },
      error: (err) => {
        console.error('Erro ao atualizar investimento:', err);
        this.isSubmitting = false;
      }
    });
  }

  deleteInvestment(id: string) {
    if (!id) return;

    const investment = this.investments.find(i => i.id === id);
    const confirmed = confirm(`Deseja realmente excluir "${investment?.name || 'este investimento'}"?`);
    if (!confirmed) return;

    this.isSubmitting = true;

    this.investmentsService.deleteInvestment(id).subscribe({
      next: () => {
        this.listInvestments();
        this.isSubmitting = false;
        this.closeUpdateInvestmentForm();
        this.showDeleteSuccess = true;
      },
      error: (err) => {
        console.error('Erro ao deletar investimento:', err);
        this.isSubmitting = false;
        alert('Ocorreu um erro ao apagar o investimento.');
      }
    });
  }

  // --- Modal: Transação / Aporte ---
  openTransactionForm(investment: Investment, event: Event) {
    event.stopPropagation();
    this.selectedInvestmentForTransaction = investment;
    this.resetTransactionPayload();

    const modal = document.querySelector('.transaction-investment-section') as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (backdrop) backdrop.style.display = 'block';
    if (modal) modal.style.display = 'block';
  }

  closeTransactionForm() {
    const modal = document.querySelector('.transaction-investment-section') as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (backdrop) backdrop.style.display = 'none';
    if (modal) modal.style.display = 'none';
    this.isSubmitting = false;
    this.selectedInvestmentForTransaction = null;
    this.resetTransactionPayload();
  }

  submitTransaction(isAporte: boolean) {
    if (!this.selectedInvestmentForTransaction) return;

    const rawAmount = Math.abs(this.transactionPayload.amount);
    if (rawAmount === 0) return;

    const finalAmount = isAporte ? rawAmount : -rawAmount;

    this.isSubmitting = true;

    this.investmentsService.addTransaction(this.selectedInvestmentForTransaction.id, {
      amount: finalAmount,
      note: this.transactionPayload.note
    }).subscribe({
      next: () => {
        this.listInvestments();
        this.isSubmitting = false;
        this.closeTransactionForm();
        this.showTransactionSuccess = true;
      },
      error: (err) => {
        console.error('Erro ao registrar transação:', err);
        this.isSubmitting = false;
        alert(err.error?.detail || 'Erro ao registrar movimentação.');
      }
    });
  }
}