import { Component, OnInit, ViewChild } from '@angular/core';
import { CajaService } from '../../../services/caja.service';
import { Caja } from '../../../interfaces/Caja';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CashAmountDialogComponent } from './dialogs/cash-amount-dialog/cash-amount-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { DetallesIngresosCajaComponent } from '../detalles-ingresos-caja/detalles-ingresos-caja.component';
import { MovimientoFormComponent } from '../../movimiento-caja/movimiento-form/movimiento-form.component';

@Component({
  selector: 'app-cash-closing',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDialogModule,
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

  constructor(private cajaService: CajaService, public dialog: MatDialog) {}

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
    console.log(typeof data.apertura);
    console.log(typeof data.ingresos);
    console.log(typeof data.egresos);
      this.caja = data;
    });
  }

  cashClose(id: number) {
    const dialogRef = this.dialog.open(CashAmountDialogComponent, {
      disableClose: true,
      autoFocus: true,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((monto: number | null) => {
      if (monto != null ) {
        console.log('Monto ingresado:', monto);

        this.cajaService.closeCaja(id,monto).subscribe((data) => {
          console.log(data);
          this.getCashOpen();
          this.getAllCash();
        });
      } else {
        console.log('Cierre de caja cancelado');
      }
    });

  }
    mostrarDetalleCaja() {
 const DialogRef = this.dialog.open(DetallesIngresosCajaComponent,{
     disableClose: true,
    autoFocus: true,
    width: '80vw', // 👈 ancho del 80% de la pantalla
    maxWidth: '1200px',

 })

}



nuevoMovimientoDeCaja(id:number) {
const dialogRef = this.dialog.open(MovimientoFormComponent,{
    autoFocus: true,
     width:'auto',
  data:{
    id:id,
  }
});
dialogRef.afterClosed().subscribe((result)=> {
 if ( result )
{
  this.getCashOpen()
}
})
}






}




