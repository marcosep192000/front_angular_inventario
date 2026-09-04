import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  ArcaFiscalDocumentResponse,
  FiscalAuthorizationStatus,
} from '../../../interfaces/arca';
import { ArcaService } from '../../../services/arca.service';
import { TokenService } from '../../../services/token.service';
@Component({
  selector: 'app-fiscal-status',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './fiscal-status.component.html',
  styleUrl: './fiscal-status.component.css',
})
export class FiscalStatusComponent implements OnInit {
  document: ArcaFiscalDocumentResponse;
  loading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: { ticketId: number; document?: ArcaFiscalDocumentResponse },
    private ref: MatDialogRef<FiscalStatusComponent>,
    private api: ArcaService,
    private token: TokenService,
    private toast: ToastrService,
  ) {
    this.document = data.document || {
      ticketId: data.ticketId,
      fiscalStatus: 'PENDING',
    };
  }
  ngOnInit() {
    this.refresh();
  }
  get status() {
    return this.document.fiscalStatus;
  }
  get authorizationStarted(): boolean {
    return this.status !== 'PENDING';
  }
  get authorized(): boolean {
    return this.status === 'AUTHORIZED';
  }
  get statusDescription(): string {
    switch (this.status) {
      case 'PENDING':
        return 'La venta quedó guardada. Falta enviarla a ARCA para solicitar el CAE.';
      case 'PROCESSING':
        return 'ARCA está procesando la solicitud. Actualizá el estado antes de realizar otra acción.';
      case 'AUTHORIZED':
        return 'El comprobante ya tiene CAE y está listo para imprimir o entregar al cliente.';
      case 'REJECTED':
        return 'ARCA rechazó la solicitud. Revisá el detalle informado antes de corregir los datos.';
      case 'RECONCILIATION_REQUIRED':
        return 'No se pudo confirmar el resultado. No generes otra venta hasta reconciliar este comprobante.';
      default:
        return 'No se pudo completar la autorización fiscal. Revisá el mensaje y la configuración.';
    }
  }
  get canAuthorize() {
    return (
      this.status === 'PENDING' &&
      this.token.hasPermission('COMPROBANTES_FISCALES_EMITIR')
    );
  }
  get canReconcile() {
    return (
      this.status === 'RECONCILIATION_REQUIRED' &&
      this.token.hasPermission('COMPROBANTES_FISCALES_CONSULTAR') &&
      !this.safeRetry
    );
  }
  get safeRetry() {
    return (
      this.document.reconciliationResult === 'NOT_FOUND_SAFE_TO_RETRY' ||
      this.document.retryAllowed === true
    );
  }
  get canRetry() {
    return (
      this.status === 'RECONCILIATION_REQUIRED' &&
      this.safeRetry &&
      this.token.hasPermission('COMPROBANTES_FISCALES_REINTENTAR')
    );
  }
  get messages() {
    const values = [
      ...(this.document.observaciones || []),
      ...(this.document.errores || []),
    ];
    return values.map((v) => (typeof v === 'string' ? v : v.message));
  }
  refresh() {
    if (this.loading) return;
    this.loading = true;
    this.api
      .getDocument(this.document.ticketId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (d) => (this.document = d),
        error: (e) => this.error(e, 'No se pudo consultar el estado fiscal.'),
      });
  }
  authorize() {
    this.run(
      this.api.authorize(this.document.ticketId),
      'Comprobante autorizado por ARCA.',
    );
  }
  reconcile() {
    this.run(
      this.api.reconcile(this.document.ticketId),
      'Estado fiscal reconciliado.',
    );
  }
  retry() {
    if (!this.canRetry) return;
    this.run(
      this.api.retry(this.document.ticketId),
      'Reintento procesado por ARCA.',
    );
  }
  print() {
    if (this.loading || this.status !== 'AUTHORIZED') return;
    this.loading = true;
    this.api
      .getTicketPdf(this.document.ticketId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (blob) => this.openPdf(blob),
        error: (e) => this.error(e, 'No se pudo generar el comprobante PDF.'),
      });
  }
  downloadQr() {
    if (this.loading || this.status !== 'AUTHORIZED') return;
    this.loading = true;
    this.api
      .getQr(this.document.ticketId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-arca-${this.document.ticketId}.png`;
          link.click();
          URL.revokeObjectURL(url);
        },
        error: (e) => this.error(e, 'No se pudo descargar el QR fiscal.'),
      });
  }
  close() {
    this.ref.close(this.document);
  }
  private openPdf(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  private run(op: ReturnType<ArcaService['authorize']>, success: string) {
    if (this.loading) return;
    this.loading = true;
    op.pipe(finalize(() => (this.loading = false))).subscribe({
      next: (d) => {
        this.document = d;
        if (d.fiscalStatus === 'AUTHORIZED') this.toast.success(success);
        else if (d.fiscalStatus === 'RECONCILIATION_REQUIRED')
          this.toast.warning(
            'No se pudo confirmar la autorización. Debe reconciliarse.',
          );
        else if (d.fiscalStatus === 'REJECTED')
          this.toast.error('ARCA rechazó el comprobante.');
      },
      error: (e) => this.error(e, 'No se pudo completar la operación fiscal.'),
    });
  }
  private error(e: unknown, fallback: string) {
    const x = e as { error?: { message?: string; error?: string } };
    this.toast.error(x.error?.message || x.error?.error || fallback);
  }
}
