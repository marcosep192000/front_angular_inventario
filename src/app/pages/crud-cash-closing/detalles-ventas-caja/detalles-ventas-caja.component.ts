import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Client } from '../../../interfaces/Client';
import { detalleCajaTipoContado } from '../../../interfaces/detalleCajaTipoContado';
import { SaleCommon } from '../../../interfaces/sale-common';
import { CajaService } from '../../../services/caja.service';
import { ClientService } from '../../../services/client.service';
import { TicketService } from '../../../services/ticket.service';
import { DetallesIngresosCajaPorFacturaComponent } from '../detalles-ingresos-caja-por-factura/detalles-ingresos-caja-por-factura.component';

interface VentaEmitida { movimiento: detalleCajaTipoContado; movimientos: detalleCajaTipoContado[]; montoCaja: number; ticket?: SaleCommon; cliente?: Client; }

@Component({
  selector: 'app-detalles-ventas-caja', standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './detalles-ventas-caja.component.html', styleUrl: './detalles-ventas-caja.component.css'
})
export class DetallesVentasCajaComponent implements OnInit {
  cargando = true;
  ventas: VentaEmitida[] = [];

  constructor(private readonly cajaService: CajaService, private readonly ticketService: TicketService, private readonly clientService: ClientService,
    private readonly dialog: MatDialog, private readonly dialogRef: MatDialogRef<DetallesVentasCajaComponent>) {}

  ngOnInit(): void {
    this.cajaService.getDetalleCajaContado().subscribe({
      next: movimientos => this.cargarVentas(movimientos),
      error: () => this.cargando = false
    });
  }

  private esVenta(movimiento: detalleCajaTipoContado): boolean {
    const categoria = String(movimiento.categoriaMovimiento || '').toUpperCase();
    const comprobante = String(movimiento.numeroComprobante || '').toUpperCase();
    return movimiento.tipo === 'INGRESO' && (categoria === 'VENTA' || /^(FACTURA|FC[-\s]?|FA[-\s]?)/.test(comprobante));
  }

  private cargarVentas(movimientos: detalleCajaTipoContado[]): void {
    const agrupadas = new Map<string, VentaEmitida>();
    movimientos.filter(movimiento => this.esVenta(movimiento)).forEach(movimiento => {
      const comprobante = this.numeroFactura(movimiento) || `venta-${movimiento.id}`;
      const existente = agrupadas.get(comprobante);
      if (existente) { existente.montoCaja += Number(movimiento.monto || 0); existente.movimientos.push(movimiento); }
      else agrupadas.set(comprobante, { movimiento, movimientos: [movimiento], montoCaja: Number(movimiento.monto || 0) });
    });
    const solicitudes = [...agrupadas.values()].map(venta => !this.numeroFactura(venta.movimiento) ? of(venta) :
      this.ticketService.getByNumero(this.numeroFactura(venta.movimiento)).pipe(
        switchMap(ticket => ticket.cliente ? of({ ...venta, ticket, cliente: ticket.cliente }) : !ticket.client ? of({ ...venta, ticket }) : this.clientService.obtenerClientePorId(ticket.client).pipe(
          map(cliente => ({ ...venta, ticket, cliente })),
          catchError(() => of({ ...venta, ticket }))
        )),
        catchError(() => of(venta))
      ));
    if (!solicitudes.length) { this.cargando = false; return; }
    forkJoin(solicitudes).subscribe(ventas => { this.ventas = ventas; this.cargando = false; });
  }

  get totalVentas(): number { return this.ventas.reduce((total, venta) => total + Number(venta.ticket?.total ?? venta.montoCaja), 0); }
  get totalGanancia(): number { return this.ventas.reduce((total, venta) => total + this.ganancia(venta.ticket), 0); }
  get porcentajeGanancia(): number { return this.totalVentas ? this.totalGanancia * 100 / this.totalVentas : 0; }
  ganancia(ticket?: SaleCommon): number {
    const total = Number(ticket?.totalProfit);
    if (Number.isFinite(total)) return total;
    return (ticket?.ticketDetails || []).reduce((acumulado, item) => acumulado +
      (Number.isFinite(Number(item.totalProfit)) ? Number(item.totalProfit) : Number(item.unitProfit || 0) * Number(item.amount || 0)), 0);
  }
  nombreCliente(cliente?: Client): string { return cliente ? `${cliente.name || ''} ${cliente.lastName || ''}`.trim() || 'Cliente sin nombre' : 'Cliente no informado'; }
  numeroFactura(movimiento: detalleCajaTipoContado): string { return movimiento.referenciaPago || String(movimiento.numeroComprobante || '').replace(/-\d{2}$/, ''); }
  movimientoNumero(movimiento: detalleCajaTipoContado): string { const match = String(movimiento.numeroComprobante || '').match(/-(\d{2})$/); return match?.[1] || '01'; }
  resumenPagos(venta: VentaEmitida): string { return venta.movimientos.map(movimiento => `${movimiento.medioPago || 'Pago'} · ${this.movimientoNumero(movimiento)}`).join(' / '); }
  verDetalle(venta: VentaEmitida): void {
    this.dialog.open(DetallesIngresosCajaPorFacturaComponent, { width: '900px', maxWidth: '96vw', data: { id: venta.movimiento.id, categoriaMovimiento: 'VENTA', numeroComprobante: this.numeroFactura(venta.movimiento), tipo: 'INGRESO' } });
  }
  cerrar(): void { this.dialogRef.close(); }
}
