import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CajaService } from '../../../services/caja.service';
import { detalleCajaTipoContado } from '../../../interfaces/detalleCajaTipoContado';
import { SaleCommon } from '../../../interfaces/sale-common';
import { TicketService } from '../../../services/ticket.service';
import { DetallesIngresosCajaPorFacturaComponent } from './../detalles-ingresos-caja-por-factura/detalles-ingresos-caja-por-factura.component';

@Component({
  selector: 'app-detalles-ingresos-caja',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    ToastrModule
  ],
  templateUrl: './detalles-ingresos-caja.component.html',
  styleUrls: ['./detalles-ingresos-caja.component.css']
})
export class DetallesIngresosCajaComponent implements OnInit {

  movimientos: detalleCajaTipoContado[] = [];
  ventas: Array<{ movimiento: detalleCajaTipoContado; montoCaja: number; ticket?: SaleCommon }> = [];
totalCheque = 0;
  totalContado = 0;
  totalTransferencia = 0;
  totalMercadoPago = 0;
  totalCtaCte = 0;
  totalGeneral = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DetallesIngresosCajaComponent>,
    private cajaService: CajaService,
    private ticketService: TicketService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {

    this.cajaService.getDetalleCajaContado().subscribe({

      next: (resp) => {

        const movimientosTipo = resp.filter(x => x.tipo === this.data.tipo);
        this.movimientos = movimientosTipo.filter(movimiento => !this.esVenta(movimiento));

        this.calcularTotales();

      },

      error: err => console.error(err)

    });

  }

  private esVenta(movimiento: detalleCajaTipoContado): boolean {
    const categoria = String(movimiento.categoriaMovimiento || '').toUpperCase();
    const comprobante = String(movimiento.numeroComprobante || '').toUpperCase();
    return categoria === 'VENTA' || /^(FACTURA|FC[-\s]?|FA[-\s]?)/.test(comprobante);
  }

  private cargarVentas(movimientos: detalleCajaTipoContado[]): void {
    if (this.data.tipo !== 'INGRESO') return;
    const agrupadas = new Map<string, { movimiento: detalleCajaTipoContado; montoCaja: number }>();
    movimientos.filter(movimiento => this.esVenta(movimiento)).forEach(movimiento => {
      const comprobante = movimiento.numeroComprobante || `venta-${movimiento.id}`;
      const existente = agrupadas.get(comprobante);
      if (existente) existente.montoCaja += Number(movimiento.monto || 0);
      else agrupadas.set(comprobante, { movimiento, montoCaja: Number(movimiento.monto || 0) });
    });

    const solicitudes = [...agrupadas.values()].map(venta => {
      const numero = venta.movimiento.numeroComprobante;
      if (!numero) return of({ ...venta });
      return this.ticketService.getByNumero(numero).pipe(
        map(ticket => ({ ...venta, ticket })),
        catchError(() => of({ ...venta }))
      );
    });
    if (!solicitudes.length) return;
    forkJoin(solicitudes).subscribe(ventas => this.ventas = ventas);
  }

  get totalVentasEmitidas(): number {
    return this.ventas.reduce((total, venta) => total + Number(venta.ticket?.total ?? venta.montoCaja ?? 0), 0);
  }

  get totalGananciaDiaria(): number {
    return this.ventas.reduce((total, venta) => total + this.obtenerGanancia(venta.ticket), 0);
  }

  get porcentajeGananciaDiaria(): number {
    return this.totalVentasEmitidas > 0 ? (this.totalGananciaDiaria / this.totalVentasEmitidas) * 100 : 0;
  }

  private obtenerGanancia(ticket?: SaleCommon): number {
    const gananciaTotal = Number(ticket?.totalProfit);
    if (Number.isFinite(gananciaTotal)) return gananciaTotal;
    return (ticket?.ticketDetails || []).reduce((total, detalle) => {
      const totalDetalle = Number(detalle.totalProfit);
      return total + (Number.isFinite(totalDetalle) ? totalDetalle : Number(detalle.unitProfit || 0) * Number(detalle.amount || 0));
    }, 0);
  }

  getGananciaVenta(ticket?: SaleCommon): number { return this.obtenerGanancia(ticket); }

  getDetalleVenta(item: detalleCajaTipoContado) {

  this.dialog.open(DetallesIngresosCajaPorFacturaComponent, {

    width: '900px',

    data: {
      id: item.id,
      categoriaMovimiento: item.categoriaMovimiento,
      numeroComprobante: item.referenciaPago || String(item.numeroComprobante || '').replace(/-\d{2}$/, ''),
      tipo: item.tipo,
      descripcion: item.descripcion,
    }

  });

}

calcularTotales(): void {

  this.totalContado = 0;
  this.totalTransferencia = 0;
  this.totalMercadoPago = 0;
  this.totalCtaCte = 0;
  this.totalCheque = 0;

  this.movimientos.forEach(mov => {

    const medio =
      (mov.medioPago || '').toUpperCase();

    switch (medio) {

      case 'EFECTIVO':

        this.totalContado += mov.monto;

        break;


      case 'TRANSFERENCIA':

        this.totalTransferencia += mov.monto;

        break;


      case 'MERCADO_PAGO':

        this.totalMercadoPago += mov.monto;

        break;

      case 'DEBITO':
      case 'CREDITO':
      case 'OTRO':

        this.totalTransferencia += mov.monto;

        break;


      case 'CTA_CTE':

        this.totalCtaCte += mov.monto;

        break;


      case 'CHEQUE':

        this.totalCheque += mov.monto;

        break;

    }

  });


  this.totalGeneral =
    this.totalContado +
    this.totalTransferencia +
    this.totalMercadoPago +
    this.totalCtaCte +
    this.totalCheque;
}

  get titulo(): string {
    return this.data.tipo === 'INGRESO'
      ? '📋 Ingresos no facturados'
      : '📋 Detalles de Egresos';
  }

  get subtitulo(): string {
    return this.data.tipo === 'INGRESO'
      ? '🟢 Movimientos de caja sin comprobante de venta'
      : '🔴 Movimientos de Egreso';
  }

  get colorHeader(): string {
    return this.data.tipo === 'INGRESO'
      ? '#ffffff'
      : '#fefdfd';
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

}
