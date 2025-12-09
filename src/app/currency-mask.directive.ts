import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements OnInit {

  constructor(private el: ElementRef, private ngControl: NgControl) { }

  ngOnInit() {
    // Formata o valor que já existe no model quando o componente inicia
    this.formatValue(this.ngControl.value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value ?? '';
    this.formatValue(value);
  }

  private formatValue(value: any) {
    if (value === null || value === undefined) {
      return;
    }

    // 1. Remove tudo que não for número para obter o valor puro em centavos
    let valueInCents = value.toString().replace(/\D/g, '');

    if (!valueInCents) {
      valueInCents = '0';
    }

    // 2. Atualiza o valor no model (newSubscription.price) com o número inteiro de centavos.
    // O { emitEvent: false } evita um loop infinito.
    this.ngControl.control?.setValue(parseInt(valueInCents, 10), { emitEvent: false });

    // 3. Formata o valor para ser exibido no campo (ex: "49,90")
    const valueAsNumber = parseInt(valueInCents, 10) / 100;
    const formattedForDisplay = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valueAsNumber);

    // 4. Atualiza o que o usuário vê no campo de input
    this.el.nativeElement.value = formattedForDisplay;
  }
}
