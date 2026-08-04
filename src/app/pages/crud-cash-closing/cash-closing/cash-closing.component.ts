import { Component, OnInit, ViewChild } from '@angular/core';
import { CajaService } from '../../../services/caja.service';
import { Caja } from '../../../interfaces/Caja';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CashAmountDialogComponent } from './dialogs/cash-amount-dialog/cash-amount-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { DetallesIngresosCajaComponent } from '../detalles-ingresos-caja/detalles-ingresos-caja.component';
import { MovimientoFormComponent } from '../../movimiento-caja/movimiento-form/movimiento-form.component';
import { ArqueoCajaComponent } from '../arqueo-caja/arqueo-caja.component';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-cash-closing',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDialogModule,
    MatIcon
],
  templateUrl: './cash-closing.component.html',
  styleUrl: './cash-closing.component.css',
})
export class CashClosingComponent implements OnInit {
  caja?: Caja;
  cajas: Caja[] = []; //
  serch: string = '';
  displayedColumns: string[] = [
    'id',
    'fecha',
    'apertura',
    'ingresos',
    'egresos',
    'cierre',
    'estado',
  ];
  dataSource = new MatTableDataSource<Caja>(this.cajas);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private cajaService: CajaService,
    public dialog: MatDialog,
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // Añadimos el paginador al datasource
  }
  ngOnInit(): void {
    this.getAllCash();
    this.getCashOpen();
  }

  getAllCash(): void {
    this.cajaService.getAllCajas().subscribe((data) => {
      this.cajas = data; // Asignar los datos a la propiedad cajas
      this.dataSource = new MatTableDataSource(this.cajas); // Actualizar el dataSource con los nuevos datos
      this.dataSource.paginator = this.paginator; // Asociar el paginador
    });
  }

  getCashOpen() {
    this.cajaService.getCajas().subscribe((data) => {
      console.log('Caja recibida:', data);
      console.log(data);
      console.log(typeof data.saldoApertura);
      console.log(typeof data.totalIngresos);
      console.log(typeof data.totalEgresos);
      this.caja = data;
    });
  }

cashClose(): void {
  console.log("CLICK CERRAR CAJA");
  if (!this.caja) {
    return;
  }

  const dialogRef = this.dialog.open(ArqueoCajaComponent, {
    disableClose: true,
    autoFocus: true,
    width: '95vw',
    maxWidth: '1400px',
    data: {
      id: this.caja.id
    }
  });

  dialogRef.afterClosed().subscribe((resultado) => {

    if (resultado) {
      this.getCashOpen();
      this.getAllCash();
    }

  });

}
  mostrarDetalleCajaIngresos() {
    const DialogRef = this.dialog.open(DetallesIngresosCajaComponent, {
      disableClose: true,
      autoFocus: true,
      width: '80vw', // 👈 ancho del 80% de la pantalla
      maxWidth: '1200px',
      data: {
        tipo: 'INGRESO',
      },
    });
  }
  mostrarDetalleCaja() {
    const DialogRef = this.dialog.open(DetallesIngresosCajaComponent, {
      disableClose: true,
      autoFocus: true,
      width: '80vw', // 👈 ancho del 80% de la pantalla
      maxWidth: '1200px',
      data: {
        tipo: 'EGRESO',
      },
    });
  }

  nuevoMovimientoDeCaja(id: number) {
    const dialogRef = this.dialog.open(MovimientoFormComponent, {
      autoFocus: true,
      width: 'auto',
      data: {
        id: id,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getCashOpen();
      }
    });
  }


}
