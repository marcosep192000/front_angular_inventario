import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ComprobanteService } from '../../../../services/comprobante.service';
import { AccionImpresion, FormatoImpresion, PrintPreferencesService } from '../../../../services/print-preferences.service';

export interface ComprobanteDialogData { tipo: 'VENTA' | 'CAJA'; id: number; numero?: string; }

@Component({ selector: 'app-imptimir-ticket', standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule],
  templateUrl: './imptimir-ticket.component.html', styleUrl: './imptimir-ticket.component.css' })
export class ImptimirTicketComponent {
  formato: FormatoImpresion; accion: AccionImpresion; procesando = false;
  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: ComprobanteDialogData,
    private readonly ref: MatDialogRef<ImptimirTicketComponent>, private readonly api: ComprobanteService,
    private readonly preferences: PrintPreferencesService, private readonly toast: ToastrService) {
    const current = preferences.get(); this.formato = data.tipo === 'CAJA' ? 'A4' : current.formato; this.accion = current.accion;
    if (data.tipo === 'VENTA' && current.accion !== 'PREGUNTAR') {
      setTimeout(() => this.obtener(current.accion === 'IMPRIMIR'));
    }
  }
  guardarPreferencias(): void { this.preferences.save({ formato: this.formato, accion: this.accion }); this.toast.success('Preferencias de impresión guardadas.'); }
  imprimir(): void { this.obtener(true); }
  descargar(): void { this.obtener(false); }
  cerrar(): void { this.ref.close(); }
  private obtener(imprimir: boolean): void {
    if (this.procesando) return; this.procesando = true;
    const request = this.data.tipo === 'CAJA' ? this.api.caja(this.data.id) : this.api.venta(this.data.id, this.formato, imprimir);
    request.pipe(finalize(() => this.procesando = false)).subscribe({ next: blob => imprimir ? this.abrirImpresion(blob) : this.guardar(blob), error: () => this.toast.error('No se pudo generar el comprobante.') });
  }
  private abrirImpresion(blob: Blob): void { const url = URL.createObjectURL(blob); const win = window.open(url, '_blank'); if (!win) { URL.revokeObjectURL(url); this.toast.warning('El navegador bloqueó la ventana de impresión.'); return; } win.addEventListener('load', () => { win.focus(); win.print(); }, { once: true }); setTimeout(() => URL.revokeObjectURL(url), 60000); }
  private guardar(blob: Blob): void { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = this.data.tipo === 'CAJA' ? `arqueo-caja-${this.data.id}.pdf` : `comprobante-${this.data.numero || this.data.id}-${this.formato.toLowerCase()}.pdf`; a.click(); URL.revokeObjectURL(url); }
}
