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
import { MovimientoCajaService

 } from '../../../services/movimiento-caja.service';

import { SaleCommon } from '../../../interfaces/sale-common';
import { MovimientoDetalle } from '../../../interfaces/movimiento-detalle';

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

  movimiento?: MovimientoDetalle;

  constructor(

    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private ticketService: TicketService,

    private movimientoService: MovimientoCajaService,

    private dialogRef: MatDialogRef<DetallesIngresosCajaPorFacturaComponent>

  ) { }

  ngOnInit(): void {

    if (this.data.categoriaMovimiento === 'VENTA') {

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

          this.cargando = false;

        },

        error: err => {

          console.error(err);

          this.cargando = false;

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

          console.error(err);

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

  cerrar(): void {

    this.dialogRef.close();

  }

}
