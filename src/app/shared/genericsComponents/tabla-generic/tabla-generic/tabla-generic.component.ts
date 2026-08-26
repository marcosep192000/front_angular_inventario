import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-tabla-generic',

  standalone: true,

  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule
  ],

  templateUrl: './tabla-generic.component.html',

  styleUrl: './tabla-generic.component.css'
})
export class TablaGenericComponent<T> implements OnInit {


  // =========================================================
  // DATOS
  // =========================================================

  @Input()
  data: T[] = [];


  @Input()
  displayedColumns: string[] = [];


  @Input()
  columnConfig: {
    [key: string]: {
      type: string
    }
  } = {};


  @Input()
  columnNames: {
    [key: string]: string
  } = {};


  // =========================================================
  // OPCIONES
  // =========================================================

  @Input()
  showActions = false;


  @Input()
  enableFilter = true;


  @Input()
  enablePagination = true;


  @Input()
  enableSorting = true;


  // =========================================================
  // COMPONENTES PERSONALIZADOS
  // =========================================================

  @Input()
  editComponent: any = null;


  @Input()
  btnCerrar = false;


  @Input()
  verDetalleFacturaComponent: any = null;


  @Input()
  deleteComponent: any = null;


  @Input()
  viewComponent: any = null;


  // =========================================================
  // TABLA
  // =========================================================

  dataSource =
    new MatTableDataSource<T>([]);


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;


  @ViewChild(MatSort)
  sort!: MatSort;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    public dialog: MatDialog
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.dataSource =
      new MatTableDataSource<T>(
        this.data
      );

  }


  // =========================================================
  // CAMBIOS DE DATOS
  // =========================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['data'] &&
      changes['data'].currentValue
    ) {

      this.dataSource.data =
        this.data;


      if (
        this.enablePagination &&
        this.paginator
      ) {

        this.dataSource.paginator =
          this.paginator;

      }


      if (
        this.enableSorting &&
        this.sort
      ) {

        this.dataSource.sort =
          this.sort;

      }

    }

  }


  // =========================================================
  // CERRAR
  // =========================================================

  onClose(): void {

    this.dialog.closeAll();

  }


  onCancel(): void {

    this.dialog.closeAll();

  }


  // =========================================================
  // FILTRO
  // =========================================================

  applyFilter(
    event: Event
  ): void {

    if (!this.enableFilter) {

      return;

    }


    const filterValue =
      (
        event.target as HTMLInputElement
      ).value;


    this.dataSource.filter =
      filterValue
        .trim()
        .toLowerCase();


    if (
      this.dataSource.paginator
    ) {

      this.dataSource.paginator.firstPage();

    }

  }


  // =========================================================
  // EDITAR / ABONAR
  // =========================================================

  abonarFactura(
    component: any,
    element: any
  ): void {

    const dialogRef =
      this.dialog.open(
        component,
        {
          disableClose: false,

          autoFocus: true,

          hasBackdrop: true,

          closeOnNavigation: true,

          data: {

            tipo: 'updateSupplier',

            updateSupplier:
              element?.id,

            element: element

          }

        }
      );


    dialogRef
      .afterClosed()
      .subscribe(() => {});

  }


  // =========================================================
  // VER FACTURA
  // =========================================================

  verFactura(
    component: any,
    element: any
  ): void {

    console.log(
      'Factura enviada al detalle:',
      element
    );


    const dialogRef =
      this.dialog.open(
        component,
        {
          width: '950px',

          maxWidth: '95vw',

          disableClose: true,

          autoFocus: true,

          hasBackdrop: true,

          closeOnNavigation: false,

          data: {

            tipo: 'detalleFactura',

            updateSupplier:
              element?.id,

            factura:
              element

          }

        }
      );


    dialogRef
      .afterClosed()
      .subscribe(() => {});

  }


}
