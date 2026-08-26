import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupplierPaymentService } from '../../../../../services/supplier-payment.service';
import { PagoFacturaProveedor } from '../../../../../interfaces/pago-factura-proveedor';



@Component({
  selector: 'app-ver-pagos-factura',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ver-pagos-factura.component.html',
  styleUrl: './ver-pagos-factura.component.css'
})
export class VerPagosFacturaComponent implements OnInit {

  cargando = true;
  error = false;
  pagos: PagoFacturaProveedor[] = [];
  factura: any = null;

  constructor(
    private supplierPaymentService: SupplierPaymentService,

    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: any,

    @Optional()
    private dialogRef: MatDialogRef<VerPagosFacturaComponent> | null
  ) {}

  ngOnInit(): void {

    this.factura = this.data?.factura ?? null;

    const facturaId =
      this.data?.facturaId ??
      this.data?.factura?.facturaId ??
      this.data?.factura?.id;

    if (!facturaId) {
      console.error('No se recibió el ID de la factura.');
      this.cargando = false;
      this.error = true;
      return;
    }

    this.cargarPagos(Number(facturaId));
  }

  cargarPagos(facturaId: number): void {

    this.cargando = true;
    this.error = false;

    this.supplierPaymentService
      .getPagosFacturaProveedor(facturaId)
      .subscribe({
        next: pagos => {
          this.pagos = Array.isArray(pagos) ? pagos : [];
          this.cargando = false;
        },
        error: error => {
          console.error('Error al obtener historial de pagos:', error);
          this.pagos = [];
          this.error = true;
          this.cargando = false;
        }
      });
  }

  cerrar(): void {
    this.dialogRef?.close();
  }

  get totalPagado(): number {
    return this.pagos
      .filter(pago => pago.aplicado)
      .reduce(
        (total, pago) => total + Number(pago.monto || 0),
        0
      );
  }

  get cantidadPagos(): number {
    return this.pagos.length;
  }

  get totalFactura(): number {
    return Number(
      this.factura?.total ??
      this.factura?.montoTotal ??
      0
    );
  }

  get saldo(): number {
    return Math.max(0, this.totalFactura - this.totalPagado);
  }

  obtenerNumeroFactura(): string {
    return String(
      this.factura?.numeroFactura ??
      this.factura?.idInvoice ??
      '-'
    );
  }

  nombreMedioPago(medio: string | null): string {

    if (!medio) {
      return 'SIN ESPECIFICAR';
    }

    const nombres: Record<string, string> = {
      EFECTIVO: 'EFECTIVO',
      TRANSFERENCIA: 'TRANSFERENCIA',
      CHEQUE: 'CHEQUE',
      TARJETA: 'TARJETA',
      TARJETA_CREDITO: 'TARJETA DE CRÉDITO',
      TARJETA_DEBITO: 'TARJETA DE DÉBITO',
      MERCADO_PAGO: 'MERCADO PAGO',
      OTRO: 'OTRO'
    };

    return nombres[medio] ?? medio;
  }

  claseEstado(estado: string | null): string {

    switch (String(estado ?? '').toUpperCase()) {
      case 'PAGADO':
        return 'estado-pagado';
      case 'APLICADO':
        return 'estado-aplicado';
      case 'CHEQUE PENDIENTE':
      case 'PENDIENTE':
        return 'estado-pendiente';
      default:
        return 'estado-default';
    }
  }

  iconoMedioPago(medio: string | null): string {

    switch (String(medio ?? '').toUpperCase()) {
      case 'EFECTIVO':
        return 'payments';
      case 'TRANSFERENCIA':
        return 'account_balance';
      case 'CHEQUE':
        return 'receipt_long';
      case 'TARJETA':
      case 'TARJETA_CREDITO':
      case 'TARJETA_DEBITO':
        return 'credit_card';
      case 'MERCADO_PAGO':
        return 'account_balance_wallet';
      default:
        return 'payments';
    }
  }
}
