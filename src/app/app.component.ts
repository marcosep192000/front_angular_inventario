import { Component, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterModule,
    CommonModule,
    MatNativeDateModule,
  ],
})
export class AppComponent {
  title = 'Inventario Pixels';

  @HostListener('document:focusout', ['$event'])
  completarCentavos(event: FocusEvent): void {
    const input = event.target as HTMLInputElement | null;

    if (!input || !this.esCampoMonetario(input)) {
      return;
    }

    const valor = input.value.trim();

    if (!valor) {
      return;
    }

    const importe = Number(valor.replace(',', '.'));

    if (!Number.isFinite(importe)) {
      return;
    }

    const conCentavos = importe.toFixed(2);

    if (input.value === conCentavos) {
      return;
    }

    input.value = conCentavos;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private esCampoMonetario(input: HTMLInputElement): boolean {
    if (input.hasAttribute('data-money')) {
      return true;
    }

    if (input.type !== 'number' || input.step !== '0.01') {
      return false;
    }

    const contexto = [
      input.getAttribute('formControlName'),
      input.name,
      input.placeholder,
      input.getAttribute('aria-label'),
      input.closest('mat-form-field, .money-input, .form-group, .pago-fila')?.textContent
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('es-AR');

    return /monto|importe|precio|price|total|saldo|limite|límite|deuda|credito|crédito|efectivo|retiro|sueldo|adelanto/.test(contexto);
  }

  @HostListener('document:keydown.enter', ['$event'])
  confirmarDialogoConEnter(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;

    const dialog = typeof document !== 'undefined'
      ? document.querySelector('.mat-mdc-dialog-container')
      : null;
    const contenedor = dialog || target?.closest('form');
    const aceptar = contenedor?.querySelector<HTMLButtonElement>(
      'button[color="primary"]:not([disabled]), button.btn-confirmar:not([disabled]), button[type="submit"]:not([disabled])'
    );
    if (!aceptar) return;

    event.preventDefault();
    aceptar.click();
  }
}
