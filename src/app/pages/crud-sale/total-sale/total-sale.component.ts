import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';

import { MedioPago, PagoTicketRequest } from '../../../interfaces/pago-ticket';
import { SaldoInsuficienteDialogComponent } from './saldo-insuficiente-dialog.component';

interface TotalSaleData {
  client: number;
  clienteNombre?: string;
  totalPrice: number;
  tipoDocumento: string;
  cuentaCorriente?: { habilitada: boolean; disponible: number };
}

@Component({
  selector: 'app-total-sale',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './total-sale.component.html',
  styleUrl: './total-sale.component.css',
})
export class TotalSaleComponent implements OnInit {
  readonly mediosPago: { valor: MedioPago; etiqueta: string }[] = [
    { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
    { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
    { valor: 'DEBITO', etiqueta: 'Tarjeta de débito' },
    { valor: 'CREDITO', etiqueta: 'Tarjeta de crédito' },
    { valor: 'MERCADO_PAGO', etiqueta: 'Mercado Pago' },
    { valor: 'CHEQUE', etiqueta: 'Cheque' },
    { valor: 'CUENTA_CORRIENTE', etiqueta: 'Cuenta corriente' },
    { valor: 'OTRO', etiqueta: 'Otro' },
  ];

  pagos: PagoTicketRequest[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: TotalSaleData,
    private readonly dialogRef: MatDialogRef<TotalSaleComponent>,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.pagos = [{ medioPago: 'EFECTIVO', monto: this.totalVenta, referencia: null }];
  }

  get totalVenta(): number {
    return this.redondear(Number(this.data.totalPrice) || 0);
  }

  get totalIngresado(): number {
    return this.redondear(this.pagos.reduce((total, pago) => total + (Number(pago.monto) || 0), 0));
  }

  get restante(): number {
    return this.redondear(this.totalVenta - this.totalIngresado);
  }

  get totalCuentaCorriente(): number {
    return this.redondear(this.pagos.filter(pago => pago.medioPago === 'CUENTA_CORRIENTE').reduce((total, pago) => total + (Number(pago.monto) || 0), 0));
  }

  get saldoCuentaCorriente(): number { return Math.max(0, Number(this.data.cuentaCorriente?.disponible) || 0); }

  get cuentaCorrienteInvalida(): boolean {
    return this.totalCuentaCorriente > 0 && (!this.data.cuentaCorriente?.habilitada || this.totalCuentaCorriente > this.saldoCuentaCorriente + 0.009);
  }

  get puedeConfirmar(): boolean {
    return this.pagos.length > 0 &&
      this.pagos.every(pago => Number(pago.monto) > 0) &&
      Math.abs(this.restante) < 0.01;
  }

  agregarPago(): void {
    this.pagos = [
      ...this.pagos,
      { medioPago: 'EFECTIVO', monto: Math.max(0, this.restante), referencia: null },
    ];
  }

  eliminarPago(index: number): void {
    if (this.pagos.length <= 1) {
      this.toastr.info('Debe quedar al menos un medio de pago.');
      return;
    }

    this.pagos = this.pagos.filter((_, currentIndex) => currentIndex !== index);
  }

  requiereReferencia(medio: MedioPago): boolean {
    return ['TRANSFERENCIA', 'DEBITO', 'CREDITO', 'MERCADO_PAGO', 'CHEQUE'].includes(medio);
  }

  confirmar(): void {
    if (!this.puedeConfirmar) {
      this.toastr.error('La suma de los pagos debe coincidir exactamente con el total de la venta.');
      return;
    }

    if (this.cuentaCorrienteInvalida) { this.mostrarSaldoInsuficiente(); return; }

    const pagos = this.pagos.map(pago => ({
      medioPago: pago.medioPago,
      monto: this.redondear(Number(pago.monto)),
      referencia: pago.referencia?.trim() || null,
    }));

    this.dialogRef.close({ pagos, totalPrice: this.totalVenta });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private mostrarSaldoInsuficiente(): void {
    this.dialog.open(SaldoInsuficienteDialogComponent, { width: '480px', maxWidth: '94vw', autoFocus: false, data: { cliente: this.data.clienteNombre || 'el cliente seleccionado', disponible: this.saldoCuentaCorriente, solicitado: this.totalCuentaCorriente, sinCuenta: !this.data.cuentaCorriente?.habilitada } });
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
