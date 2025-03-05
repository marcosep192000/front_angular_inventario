import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './tabla-generic.component.html',
  styleUrl: './tabla-generic.component.css',
})
export class TablaGenericComponent<T> implements OnInit {
  @Input() data: T[] = []; // Recibe los datos
  @Input() displayedColumns: string[] = []; // Columnas a mostrar
  @Input() columnConfig: { [key: string]: { type: string } } = {}; // Configuración de columnas
  @Input() showActions: boolean = false; // Mostrar columna de acciones
  @Input() enableFilter: boolean = true; // Habilitar/deshabilitar filtro
  @Input() enablePagination: boolean = true; // Habilitar/deshabilitar paginación
  @Input() enableSorting: boolean = true; // Habilitar/deshabilitar ordenamiento
  @Input() columnNames: { [key: string]: string } = {};
  // Componentes personalizados para cada acción
  @Input() editComponent: any = null;
  @Input() verDetalleFacturaComponent: any = null;
  @Input() deleteComponent: any = null;
  @Input() viewComponent: any = null;

  dataSource = new MatTableDataSource<T>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.dataSource.data = this.data;
      if (this.enablePagination && this.paginator)
        this.dataSource.paginator = this.paginator;
      if (this.enableSorting && this.sort) this.dataSource.sort = this.sort;
    }
  }
  delete(component: any, id: number) {}
  applyFilter(event: Event) {
    if (!this.enableFilter) return;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abonarFactura(component: any, id: number) {
    const dialogRef = this.dialog.open(component, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'updateSupplier',
        updateSupplier: id,
      },
    });
    dialogRef.afterClosed().subscribe(() => {});
  }
  cancelarFactura() {}

  verFactura(component: any, id: number) {
    const dialogRef = this.dialog.open(component, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'updateSupplier',
        updateSupplier: id,
      },
    });
    dialogRef.afterClosed().subscribe(() => {});
  }
}


