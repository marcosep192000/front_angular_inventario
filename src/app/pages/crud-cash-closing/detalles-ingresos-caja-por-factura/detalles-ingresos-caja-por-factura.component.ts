import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TicketService } from '../../../services/ticket.service';
import { MovimientoCajaService } from '../../../services/movimiento-caja.service';
import { ClientService } from '../../../services/client.service';

import { SaleCommon, TicketDetail } from '../../../interfaces/sale-common';
import { MovimientoDetalle } from '../../../interfaces/movimiento-detalle';
import { Client } from '../../../interfaces/Client';

@Component({
  selector: 'app-detalles-ingresos-caja-por-factura',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './detalles-ingresos-caja-por-factura.component.html',
  styleUrl: './detalles-ingresos-caja-por-factura.component.css'
})
export class DetallesIngresosCajaPorFacturaComponent implements OnInit {

  cargando = true;

  ticket?: SaleCommon;
  cliente?: Client;

  movimiento?: MovimientoDetalle;


  constructor(

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private ticketService: TicketService,

    private movimientoService: MovimientoCajaService,
    private clientService: ClientService,

    private dialogRef:
      MatDialogRef<DetallesIngresosCajaPorFacturaComponent>

  ) {}


  ngOnInit(): void {

    if (
      String(this.data.categoriaMovimiento ?? '').toUpperCase() === 'VENTA' ||
      this.data.numeroComprobante
    ) {

      this.cargarVenta();

    } else {

      this.cargarMovimiento();

    }

  }


  private cargarVenta(): void {

    this.ticketService
      .getByNumero(this.data.numeroComprobante)
      .subscribe({

        next: resp => {

          this.ticket = resp;
          this.cliente = resp.cliente;
          if (!this.cliente && resp.client) this.clientService.obtenerClientePorId(resp.client).subscribe({ next: cliente => this.cliente = cliente });
          this.cargando = false;

        },

        error: err => {

          console.error(
            'Error al cargar la venta:',
            err
          );

          // Si el movimiento no corresponde a un ticket, mantenemos el
          // comportamiento anterior y cargamos su detalle de caja.
          this.cargarMovimiento();

        }

      });

  }


  private cargarMovimiento(): void {

    this.movimientoService
      .getDetalle(this.data.id)
      .subscribe({

        next: resp => {

          this.movimiento = resp;

          this.cargando = false;

        },

        error: err => {

          console.error(
            'Error al cargar el movimiento:',
            err
          );

          this.cargando = false;

        }

      });

  }


  get esVenta(): boolean {

    return this.ticket != null;

  }


  get esMovimiento(): boolean {

    return this.movimiento != null;

  }

  get detallesVenta() {
    return this.ticket?.ticketDetails ?? [];
  }

  detallePresentacion(detalle: TicketDetail): string {
    return [detalle.presentationSnapshot, detalle.variantSnapshot]
      .filter(Boolean)
      .join(' · ');
  }

  cantidadDetalle(detalle: TicketDetail): string {
    const cantidad = Number(detalle.quantity ?? detalle.amount ?? 0);
    const valor = new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 6,
    }).format(cantidad);
    return `${valor}${detalle.unitSnapshot ? ` ${detalle.unitSnapshot}` : ''}`;
  }


  cerrar(): void {

    this.dialogRef.close();

  }

}
