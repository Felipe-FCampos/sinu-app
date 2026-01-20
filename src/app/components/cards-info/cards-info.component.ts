import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core'; // Importe o Input
import { Card, Invoice, StandalonePayment } from 'src/app/services/cards.service';
import { Subscription } from '../subscriptions/subscriptions.component';

@Component({
  selector: 'app-cards-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards-info.component.html',
  styleUrls: ['./cards-info.component.scss'],
})
export class CardsInfoComponent implements OnInit {
  // Recebe o cartão, o estado de erro e loading do componente pai
  @Input() card: Card | null = null;
  @Input() subscriptions: Subscription[] = [];
  @Input() standalonePayments: StandalonePayment[] = [];
  @Input() invoices: Invoice[] = [];
  @Input() error: string | null = null;
  @Input() isLoading: boolean = true;

  // Remova o constructor e o ngOnInit, eles não são mais necessários aqui.
  constructor() { }

  ngOnInit() {
    console.log('teste: ', this.standalonePayments)
  }
}
