import { Component, OnInit, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { MatIconModule } from '@angular/material/icon';

import { CajaService } from '../../../services/caja.service';

import { Caja } from '../../../interfaces/Caja';

import { DetallesIngresosCajaComponent } from '../detalles-ingresos-caja/detalles-ingresos-caja.component';
import { DetallesVentasCajaComponent } from '../detalles-ventas-caja/detalles-ventas-caja.component';

import { MovimientoFormComponent } from '../../movimiento-caja/movimiento-form/movimiento-form.component';

import { ArqueoCajaComponent } from '../arqueo-caja/arqueo-caja.component';

@Component({
  selector: 'app-cash-closing',

  standalone: true,

  imports: [
    CommonModule,

    MatTableModule,

    MatButtonModule,

    MatPaginatorModule,

    MatDialogModule,

    MatIconModule,
  ],

  templateUrl: './cash-closing.component.html',

  styleUrl: './cash-closing.component.css',
})
export class CashClosingComponent implements OnInit {
  // =====================================================
  // CAJA ABIERTA ACTUAL
  // =====================================================

  caja?: Caja;

  // =====================================================
  // TODAS LAS CAJAS
  // =====================================================

  cajas: Caja[] = [];

  // =====================================================
  // CAJA PENDIENTE DE APERTURA
  // =====================================================

  cajaPendiente?: Caja;

  // =====================================================
  // CONTROL DE APERTURA
  // =====================================================

  abriendoCaja = false;

  // =====================================================
  // BÚSQUEDA
  // =====================================================

  serch = '';

  // =====================================================
  // COLUMNAS
  // =====================================================

  displayedColumns: string[] = [
    'id',

    'fecha',

    'apertura',

    'ingresos',

    'egresos',

    'cierre',

    'estado',
  ];

  // =====================================================
  // TABLA
  // =====================================================

  dataSource = new MatTableDataSource<Caja>([]);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private cajaService: CajaService,

    public dialog: MatDialog,
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    console.log('========== CASH CLOSING ==========');

    console.log('Inicializando módulo de caja...');

    this.getAllCash();

    this.getCashOpen();

    this.getCashPending();
  }

  // =====================================================
  // PAGINADOR
  // =====================================================

 ngAfterViewInit(): void {

  this.dataSource.paginator = this.paginator;

}

  // =====================================================
  // OBTENER TODAS LAS CAJAS
  // =====================================================

  // =====================================================
  // OBTENER TODAS LAS CAJAS
  // =====================================================

  getAllCash(): void {
    this.cajaService.getAllCajas().subscribe({
      next: (data: Caja[]) => {
        console.log('========== TODAS LAS CAJAS ==========');

        console.log('Cantidad recibida:', data.length);

        console.log(data);

        // =================================================
        // ACTUALIZAR ARRAY
        // =================================================

        this.cajas = data;

        // =================================================
        // ACTUALIZAR DATASOURCE
        // NO CREAR UNO NUEVO
        // =================================================

        this.dataSource.data = this.cajas;

        // =================================================
        // ASEGURAR PAGINADOR
        // =================================================

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        console.log('Cantidad en DataSource:', this.dataSource.data.length);

        console.log('Cantidad de filas por página:', this.paginator?.pageSize);

        console.log('====================================');
      },

      error: (err) => {
        console.error('Error obteniendo todas las cajas:', err);

        this.cajas = [];

        this.dataSource.data = [];
      },
    });
  }

  // =====================================================
  // OBTENER CAJA ABIERTA
  // =====================================================

  getCashOpen(): void {
    this.cajaService.getCajas().subscribe({
      next: (data: Caja) => {
        console.log('========== RESPUESTA CAJA ==========');

        console.log(data);

        console.log('ID:', data.id);

        console.log('Estado:', data.estado);

        console.log('=====================================');

        // =================================================
        // SOLO CONSIDERAMOS ABIERTA UNA CAJA CON FALSE
        // =================================================

        if (data && data.estado === false) {
          this.caja = data;

          return;
        }

        // =================================================
        // SI NO ES FALSE, NO HAY CAJA ABIERTA
        // =================================================

        this.caja = undefined;
      },

      error: (err) => {
        console.log('No hay caja abierta actualmente.');

        this.caja = undefined;
      },
    });
  }

  // =====================================================
  // OBTENER CAJA PENDIENTE
  // =====================================================

  getCashPending(): void {
    this.cajaService.getCajaPendiente().subscribe({
      next: (data: Caja | null) => {
        console.log('========== CAJA PENDIENTE ==========');

        console.log(data);

        // =================================================
        // SOLO NULL SIGNIFICA PENDIENTE
        // =================================================

        if (data && data.estado === null) {
          this.cajaPendiente = data;

          console.log('Caja pendiente:', data.id);

          console.log('Saldo apertura:', data.saldoApertura);

          console.log('Efectivo próxima caja:', data.efectivoProximaCaja);
        } else {
          console.log('La respuesta NO es una caja pendiente.');

          this.cajaPendiente = undefined;
        }

        console.log('====================================');
      },

      error: (err) => {
        console.log('No existe una caja pendiente de apertura.');

        this.cajaPendiente = undefined;
      },
    });
  }

  // =====================================================
  // CERRAR CAJA
  // =====================================================

  cashClose(): void {
    console.log('========== CLICK CERRAR CAJA ==========');

    // ===================================================
    // VALIDAR CAJA
    // ===================================================

    if (!this.caja) {
      console.error('No existe una caja abierta para cerrar.');

      return;
    }

    // ===================================================
    // ABRIR ARQUEO
    // ===================================================

    const dialogRef = this.dialog.open(ArqueoCajaComponent, {
      disableClose: true,

      autoFocus: true,

    

      data: {
        id: this.caja.id,
      },
    });

    // ===================================================
    // RESULTADO DEL ARQUEO
    // ===================================================

    dialogRef.afterClosed().subscribe((resultado) => {
      if (!resultado) {
        return;
      }

      console.log('========== CAJA CERRADA ==========');

      // =============================================
      // YA NO TENEMOS CAJA ABIERTA
      // =============================================

      this.caja = undefined;

      // =============================================
      // ACTUALIZAR INFORMACIÓN
      // =============================================

      this.getAllCash();

      this.getCashOpen();

      this.getCashPending();
    });
  }

  // =====================================================
  // DETALLE DE INGRESOS
  // =====================================================

  mostrarDetalleCajaIngresos(): void {
    this.dialog.open(DetallesIngresosCajaComponent, {
      disableClose: true,

      autoFocus: true,

      width: '94vw',

      maxWidth: '1400px',

      maxHeight: 'none',

      data: {
        tipo: 'INGRESO',
      },
    });
  }

  mostrarVentasFacturadas(): void {
    this.dialog.open(DetallesVentasCajaComponent, {
      disableClose: true,
      autoFocus: true,
      width: '1000px',
      maxWidth: '96vw'
    });
  }

  // =====================================================
  // DETALLE DE EGRESOS
  // =====================================================

  mostrarDetalleCaja(): void {
    this.dialog.open(DetallesIngresosCajaComponent, {
      disableClose: true,

      autoFocus: true,

      width: '94vw',

      maxWidth: '1400px',

      maxHeight: 'none',

      data: {
        tipo: 'EGRESO',
      },
    });
  }

  // =====================================================
  // NUEVO MOVIMIENTO
  // =====================================================

  nuevoMovimientoDeCaja(id: number): void {
    const dialogRef = this.dialog.open(MovimientoFormComponent, {
      autoFocus: true,

      width: 'auto',

      data: {
        id: id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      console.log('Movimiento registrado.');

      this.getCashOpen();

      this.getAllCash();
    });
  }

  // =====================================================
  // ABRIR CAJA PENDIENTE
  // =====================================================

  abrirCaja(): void {
    // ===================================================
    // VALIDAR CAJA PENDIENTE
    // ===================================================

    if (!this.cajaPendiente) {
      console.error('No existe una caja pendiente de apertura.');

      return;
    }

    // ===================================================
    // EVITAR DOBLE CLICK
    // ===================================================

    if (this.abriendoCaja) {
      return;
    }

    // ===================================================
    // ACTIVAR ESTADO
    // ===================================================

    this.abriendoCaja = true;

    console.log('========== ABRIENDO CAJA ==========');

    console.log('Caja:', this.cajaPendiente.id);

    console.log('Saldo apertura:', this.cajaPendiente.saldoApertura);

    console.log(
      'Efectivo próxima caja:',
      this.cajaPendiente.efectivoProximaCaja,
    );

    console.log('===================================');

    // ===================================================
    // LLAMAR BACKEND
    // ===================================================

    this.cajaService.abrirCaja(this.cajaPendiente.id).subscribe({
      // ===============================================
      // ÉXITO
      // ===============================================

      next: (cajaAbierta: Caja) => {
        console.log('========== CAJA ABIERTA ==========');

        console.log(cajaAbierta);

        console.log('===================================');

        // =============================================
        // GUARDAR CAJA ABIERTA
        // =============================================

        this.caja = cajaAbierta;

        // =============================================
        // YA NO ESTÁ PENDIENTE
        // =============================================

        this.cajaPendiente = undefined;

        // =============================================
        // FINALIZAR PROCESO
        // =============================================

        this.abriendoCaja = false;

        // =============================================
        // ACTUALIZAR INFORMACIÓN
        // =============================================

        this.getAllCash();

        this.getCashOpen();
      },

      // ===============================================
      // ERROR
      // ===============================================

      error: (err) => {
        console.error('Error abriendo caja:', err);

        this.abriendoCaja = false;
      },
    });
  }
}
