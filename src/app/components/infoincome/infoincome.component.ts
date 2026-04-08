import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localePt from '@angular/common/locales/pt';
import { Income, IncomeService, CreateIncomePayload } from 'src/app/services/income.service';
import { FilterComponent } from '../filter/filter.component';
import { CurrencyMaskDirective } from '../../currency-mask.directive';

registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-infoincome',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterComponent,
    CurrencyMaskDirective
  ],
  templateUrl: './infoincome.component.html',
  styleUrl: './infoincome.component.scss',
})
export class InfoincomeComponent implements OnInit {
  incomes: Income[] = [];
  allIncomes: Income[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Controle de Modais e Estados
  showSuccess: boolean = false;
  isUpdateMode: boolean = false;
  editingIncomeId: string | null = null;
  isSortedByDate: boolean = false;

  newIncome: Income = {
    name: '',
    description: '',
    amount: 0,
    currency: 'BRL',
    category: 'Trabalho',
    receivedDate: new Date().toISOString().split('T')[0],
    isRecurring: false
  };

  constructor(private incomeService: IncomeService) { }

  ngOnInit(): void {
    this.fetchIncomes();
  }

  fetchIncomes() {
    this.isLoading = true;
    this.incomeService.getAllIncomes().subscribe({
      next: (data: Income[]) => {
        this.allIncomes = data;
        this.incomes = [...this.allIncomes];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar receitas:', err);
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Filtro e Ordenação ---
  filterIncomes(searchTerm: string) {
    if (!searchTerm) {
      this.incomes = [...this.allIncomes];
    } else {
      this.incomes = this.allIncomes.filter(inc =>
        inc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  toggleSortByDate() {
    this.isSortedByDate = !this.isSortedByDate;
    if (this.isSortedByDate) {
      this.incomes.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());
    } else {
      this.fetchIncomes();
    }
  }

  // --- Helpers de Formatação ---
  public getLocaleByCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BRL': return 'pt-BR';
      case 'USD': return 'en-US';
      case 'EUR': return 'de-DE';
      default: return 'pt-BR';
    }
  }

  // --- Gerenciamento de Modais ---
  openAddIncomeForm() {
    this.isUpdateMode = false;
    this.resetForm();
    this.toggleModal('.add-subscription-section', 'block');
  }

  openUpdateIncomeForm(income: Income) {
    this.isUpdateMode = true;
    this.editingIncomeId = income.id!;
    // Criamos uma cópia para não alterar a lista principal antes de salvar
    this.newIncome = { ...income };
    this.toggleModal('.add-subscription-section', 'block');
  }

  closeIncomeForm() {
    this.toggleModal('.add-subscription-section', 'none');
    this.isUpdateMode = false;
    this.editingIncomeId = null;
    this.resetForm();
  }

  private toggleModal(selector: string, display: string) {
    const modal = document.querySelector(selector) as HTMLElement;
    const backdrop = document.querySelector('.div_background_modal') as HTMLElement;
    if (modal) modal.style.display = display;
    if (backdrop) backdrop.style.display = display;
  }

  resetForm() {
    this.newIncome = {
      name: '',
      description: '',
      amount: 0,
      currency: 'BRL',
      category: 'Trabalho',
      receivedDate: new Date().toISOString().split('T')[0],
      isRecurring: false
    };
    this.isSubmitting = false;
  }

  // --- Ações de API ---
  addIncome() {
    if (!this.newIncome.name || this.newIncome.amount <= 0) return;

    this.isSubmitting = true;
    const payload: CreateIncomePayload = { ...this.newIncome };

    this.incomeService.addIncome(payload).subscribe({
      next: () => {
        this.showSuccess = true;
        this.fetchIncomes();
        this.closeIncomeForm();
      },
      error: (err) => {
        console.error('Erro ao adicionar:', err);
        this.isSubmitting = false;
      }
    });
  }

  updateIncome() {
    if (!this.editingIncomeId) return;

    this.isSubmitting = true;
    this.incomeService.updateIncome(this.editingIncomeId, this.newIncome).subscribe({
      next: () => {
        this.showSuccess = true;
        this.fetchIncomes();
        this.closeIncomeForm();
      },
      error: (err) => {
        console.error('Erro ao atualizar:', err);
        this.isSubmitting = false;
      }
    });
  }

  deleteIncome(id: string) {
    if (!confirm('Deseja realmente excluir esta receita?')) return;

    this.isSubmitting = true;
    this.incomeService.deleteIncome(id).subscribe({
      next: () => {
        this.fetchIncomes();
        this.closeIncomeForm();
      },
      error: (err) => {
        console.error('Erro ao deletar:', err);
        this.isSubmitting = false;
      }
    });
  }
}