import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  searchTerm: string = '';
  public isFilterPanelOpen = false; // 1. Adicione esta propriedade

  // --- INPUTS E OUTPUTS ---
  @Input() statusOptions: { label: string, value: any }[] = [];
  @Input() showSortButton: boolean = false;
  @Input() isSorted: boolean = false; // Novo Input para o estado da ordenação
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<void>();

  // Objeto para rastrear os checkboxes
  selectedStatuses: { [key: string]: boolean } = {};

  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onSortClick(): void {
    this.sortChange.emit();
  }

  // 2. Simplifique este método
  openFilters() {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  onStatusChange() {
    const selected = Object.keys(this.selectedStatuses)
      .filter(key => this.selectedStatuses[key])
      .map(key => Number(key)); // Converte as chaves de volta para número

    this.statusChange.emit(selected);
  }
}
