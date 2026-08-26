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
import { CajaService } from '../../../services/caja.service';
import { detalleCajaTipoContado } from '../../../interfaces/detalleCajaTipoContado';
import { SaleCommon } from '../../../interfaces/sale-common';
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
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {

    this.cajaService.getDetalleCajaContado().subscribe({

      next: (resp) => {

        this.movimientos = resp.filter(x => x.tipo === this.data.tipo);

        this.calcularTotales();

      },

      error: err => console.error(err)

    });

  }

 getDetalleVenta(item: detalleCajaTipoContado) {

  this.dialog.open(DetallesIngresosCajaPorFacturaComponent, {

    width: '900px',

    data: {
      id: item.id,
      categoriaMovimiento: item.categoriaMovimiento,
      numeroComprobante: item.numeroComprobante
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
      ? '📋 Detalles de Ingresos'
      : '📋 Detalles de Egresos';
  }

  get subtitulo(): string {
    return this.data.tipo === 'INGRESO'
      ? '🟢 Movimientos de Ingreso'
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
