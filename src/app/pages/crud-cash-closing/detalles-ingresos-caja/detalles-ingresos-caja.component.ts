import { DetallesIngresosCajaPorFacturaComponent } from './../detalles-ingresos-caja-por-factura/detalles-ingresos-caja-por-factura.component';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
    ToastrModule,
  ],
  templateUrl: './detalles-ingresos-caja.component.html',
  styleUrls: ['./detalles-ingresos-caja.component.css'], // 👈 era "styleUrl" (incorrecto)
})
export class DetallesIngresosCajaComponent implements OnInit {
getDetalleVenta() {
   const dialogRef  = this.dialog.open(DetallesIngresosCajaPorFacturaComponent,{
width:'500px' , 
height:'auto',
 
   })





}
  movimientos: detalleCajaTipoContado[] = [];

  totalContado: number = 0;
  totalTransferencia: number = 0;
  totalMercadoPago: number = 0;
  totalGeneral: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SaleCommon,
    private dialogRef: MatDialogRef<DetallesIngresosCajaComponent>,
    private cajaService: CajaService, public dialog : MatDialog
  ) {}

  ngOnInit(): void {
    // Cargar los movimientos desde el servicio
    this.cajaService.getDetalleCajaContado().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.calcularTotales(); // 👈 llama al método correcto
      },
      error: (err) => {
        console.error('Error al cargar los movimientos', err);
      },
    });
  }

  calcularTotales(): void {
    // Reiniciar totales
    this.totalContado = 0;
    this.totalTransferencia = 0;
    this.totalMercadoPago = 0;

    this.movimientos.forEach((mov) => {
      const tipo = mov.tipoDeContado?.toLowerCase() || '';
      const monto = mov.monto || 0;

      if (tipo.includes('efectivo')) {
        this.totalContado += monto;
      } else if (tipo.includes('transferencia')) {
        this.totalTransferencia += monto;
      } else if (tipo.includes('mercado')) {
        this.totalMercadoPago += monto;
      }
    });

    this.totalGeneral = this.totalContado + this.totalTransferencia + this.totalMercadoPago;
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }
}
