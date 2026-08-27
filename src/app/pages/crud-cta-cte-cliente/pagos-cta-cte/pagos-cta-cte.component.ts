import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { TicketCtaCtePendienteCliente } from '../../../interfaces/TicketCtaCtePendienteCliente';
import { CobroCuentaCorrienteRequest, CobroCuentaCorrienteResponse, MedioPagoCobro, PagoCuentaCorrienteRequest } from '../../../interfaces/cobro-cuenta-corriente';
import { CtaCteService } from '../../../services/cta-cte.service';

@Component({ selector: 'app-pagos-cta-cte', standalone: true, imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatTableModule], templateUrl: './pagos-cta-cte.component.html', styleUrl: './pagos-cta-cte.component.css' })
export class PagosCtaCteComponent implements OnInit {
  readonly mediosPago: { value: MedioPagoCobro; label: string }[] = [
    { value: 'EFECTIVO', label: 'Efectivo' }, { value: 'TRANSFERENCIA', label: 'Transferencia' }, { value: 'DEBITO', label: 'Tarjeta de débito' }, { value: 'CREDITO', label: 'Tarjeta de crédito' }, { value: 'MERCADO_PAGO', label: 'Mercado Pago' }, { value: 'CHEQUE', label: 'Cheque' }, { value: 'OTRO', label: 'Otro' },
  ];
  readonly displayedColumns = ['fecha', 'tipo', 'total', 'saldo', 'aplicar'];
  facturas: TicketCtaCtePendienteCliente[] = [];
  pagos: PagoCuentaCorrienteRequest[] = [{ medioPago: 'EFECTIVO', monto: 0, referencia: null }];
  montosAplicados: Record<number, number> = {};
  observacion = '';
  cargando = false;
  mostrandoHistorial = false;
  historial: CobroCuentaCorrienteResponse[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { idCliente: number }, private readonly dialogRef: MatDialogRef<PagosCtaCteComponent>, private readonly ctaCteService: CtaCteService, private readonly toastr: ToastrService) {}
  ngOnInit(): void { this.cargarFacturas(); }
  get aplicaciones() { return this.facturas.map((factura) => ({ ticketId: factura.id, monto: this.montosAplicados[factura.id] || 0 })).filter((aplicacion) => aplicacion.monto > 0); }
  get totalAplicado(): number { return this.aplicaciones.reduce((total, aplicacion) => total + Number(aplicacion.monto || 0), 0); }
  get totalPagos(): number { return this.pagos.reduce((total, pago) => total + Number(pago.monto || 0), 0); }
  get diferencia(): number { return this.totalAplicado - this.totalPagos; }
  get importesCuadrados(): boolean { return Math.abs(this.diferencia) < 0.01; }
  get puedeConfirmar(): boolean { return this.aplicaciones.length > 0 && this.pagos.length > 0 && this.pagos.every((pago) => Number(pago.monto) > 0) && this.importesCuadrados && !this.cargando; }
  cargarFacturas(): void {
    this.cargando = true;
    this.ctaCteService.obtenerFacturasPendientes(this.data.idCliente).subscribe({ next: (facturas) => { this.facturas = facturas; this.montosAplicados = {}; this.cargando = false; }, error: () => { this.cargando = false; this.toastr.error('No se pudieron cargar las facturas pendientes.'); } });
  }
  actualizarAplicacion(factura: TicketCtaCtePendienteCliente, valor: number | string): void {
    const monto = Math.max(0, Number(valor) || 0); const saldo = Number(factura.saldoPendiente || 0);
    if (monto > saldo) { this.montosAplicados[factura.id] = saldo; this.toastr.warning('No se puede aplicar un importe mayor al saldo pendiente.'); return; }
    this.montosAplicados[factura.id] = monto;
  }
  aplicarSaldoCompleto(factura: TicketCtaCtePendienteCliente): void { this.montosAplicados[factura.id] = Number(factura.saldoPendiente || 0); }
  agregarPago(): void { this.pagos.push({ medioPago: 'EFECTIVO', monto: 0, referencia: null }); }
  eliminarPago(indice: number): void { if (this.pagos.length > 1) this.pagos.splice(indice, 1); }
  requiereReferencia(medio: MedioPagoCobro): boolean { return ['TRANSFERENCIA', 'DEBITO', 'CREDITO', 'MERCADO_PAGO', 'CHEQUE'].includes(medio); }
  confirmarCobro(): void {
    if (!this.puedeConfirmar) { this.toastr.warning('Los pagos y las aplicaciones deben tener el mismo total y montos mayores a cero.'); return; }
    const payload: CobroCuentaCorrienteRequest = { pagos: this.pagos.map((pago) => ({ ...pago, monto: Number(pago.monto), referencia: pago.referencia?.trim() || null })), aplicaciones: this.aplicaciones.map((aplicacion) => ({ ...aplicacion, monto: Number(aplicacion.monto) })), observacion: this.observacion.trim() || null };
    this.cargando = true;
    this.ctaCteService.registrarCobro(this.data.idCliente, payload).subscribe({ next: (cobro) => { this.cargando = false; this.toastr.success(`Cobro ${cobro.numeroComprobante} registrado correctamente.`); this.dialogRef.close(true); }, error: (error) => { this.cargando = false; this.toastr.error(error?.error?.error || 'No se pudo registrar el cobro.'); } });
  }
  verHistorial(): void {
    this.mostrandoHistorial = !this.mostrandoHistorial;
    if (!this.mostrandoHistorial || this.historial.length) return;
    this.ctaCteService.obtenerHistorialCobros(this.data.idCliente).subscribe({ next: (historial) => this.historial = historial, error: () => this.toastr.error('No se pudo cargar el historial de cobros.') });
  }
  cerrar(): void { this.dialogRef.close(false); }
}
