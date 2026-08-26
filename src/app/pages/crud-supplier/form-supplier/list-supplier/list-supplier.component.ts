import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatTooltipModule } from '@angular/material/tooltip';

import { MatTabsModule } from '@angular/material/tabs';

import { HttpErrorResponse } from '@angular/common/http';

import { Supplier } from '../../../../interfaces/supplier';

import { SupplierService } from '../../../../services/supplier.service';

import { FormSupplierComponent } from '../form-supplier.component';

import { DialogGenericComponent } from '../../../../shared/genericsComponents/dialog-generic/dialog-generic.component';

import { PaySupplierComponent } from '../../pay-supplier/pay-supplier/pay-supplier.component';

import { IconComponent } from '../../../../shared/dasboard/icon/icon.component';

import { RegistrarFacturaProveedorComponent } from '../../registrar-factura-proveedor/registrar-factura-proveedor.component';

@Component({
  selector: 'app-list-supplier',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule,
    IconComponent,
    RegistrarFacturaProveedorComponent,
    PaySupplierComponent,
  ],

  templateUrl: './list-supplier.component.html',

  styleUrl: './list-supplier.component.css',
})
export class ListSupplierComponent implements OnInit, AfterViewInit {
  // =========================================================
  // PROVEEDORES
  // =========================================================

  suppliers: Supplier[] = [];

  // =========================================================
  // TABLA
  // =========================================================

  displayedColumns: string[] = [
    'id',

    'cuit',

    'name',

    'email',

    'phone',

    'contact',

    'address',

    'Opciones',
  ];

  dataSource = new MatTableDataSource<Supplier>([]);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  // =========================================================
  // ESTADO
  // =========================================================

  loading = false;

  deleting = false;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private supplierService: SupplierService,

    public dialog: MatDialog,
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.configurarFiltro();

    this.getSuppliers();
  }

  // =========================================================
  // AFTER VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // =========================================================
  // CONFIGURAR FILTRO
  // =========================================================

  private configurarFiltro(): void {
    this.dataSource.filterPredicate = (
      supplier: Supplier,
      filter: string,
    ): boolean => {
      const texto = [
        supplier.id,

        supplier.cuit,

        supplier.name,

        supplier.email,

        supplier.phone,

        supplier.contact,

        supplier.address,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      return texto.includes(filter);
    };
  }

  // =========================================================
  // BUSCAR
  // =========================================================

  applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;

    const filterValue = input.value.trim().toLowerCase();

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // =========================================================
  // OBTENER PROVEEDORES
  // =========================================================

  getSuppliers(): void {
    this.loading = true;

    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers: Supplier[]) => {
        this.suppliers = suppliers ?? [];

        this.dataSource.data = this.suppliers;

        this.loading = false;

        console.log('Proveedores:', this.suppliers);
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;

        this.suppliers = [];

        this.dataSource.data = [];

        console.error('Error al obtener proveedores:', error);
      },
    });
  }

  // =========================================================
  // CREAR PROVEEDOR
  // =========================================================

  createSupplier(): void {
    const dialogRef = this.dialog.open(FormSupplierComponent, {
      width: '650px',

      maxWidth: '95vw',

      disableClose: true,

      autoFocus: true,

      hasBackdrop: true,

      closeOnNavigation: false,

      data: {
        tipo: 'createSupplier',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getSuppliers();
      }
    });
  }

  // =========================================================
  // EDITAR PROVEEDOR
  // =========================================================

  updateSupplier(id: number): void {
    if (!id) {
      console.error('ID de proveedor inválido.');

      return;
    }

    const dialogRef = this.dialog.open(FormSupplierComponent, {
      width: '650px',

      maxWidth: '95vw',

      disableClose: true,

      autoFocus: true,

      hasBackdrop: true,

      closeOnNavigation: false,

      data: {
        tipo: 'updateSupplier',

        updateSupplier: id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getSuppliers();
      }
    });
  }

  // =========================================================
  // ELIMINAR PROVEEDOR
  // =========================================================

  deleteSupplier(supplier: Supplier): void {
    if (!supplier.id) {
      console.error('El proveedor no tiene ID.');

      return;
    }

    const dialogRef = this.dialog.open(DialogGenericComponent, {
      width: '450px',

      maxWidth: '95vw',

      disableClose: true,

      autoFocus: true,

      hasBackdrop: true,

      closeOnNavigation: false,

      data: {
        component: 'supplier',

        data: 'Eliminar',

        state: 'Eliminar',

        icon: 'delete',

        message: `¿Estás seguro de eliminar el proveedor "${supplier.name}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== true) {
        return;
      }

      this.deleting = true;

      this.supplierService.deleteSupplier(supplier.id!).subscribe({
        next: () => {
          this.deleting = false;

          this.getSuppliers();
        },

        error: (error: HttpErrorResponse) => {
          this.deleting = false;

          console.error('Error al eliminar proveedor:', error);
        },
      });
    });
  }

  // =========================================================
  // TRACK BY
  // =========================================================

  trackBySupplierId(index: number, supplier: Supplier): number {
    return supplier.id ?? index;
  }

  pagarProveedor(supplier: Supplier): void {

  if (!supplier?.id) {
    console.error('El proveedor seleccionado no tiene ID.');
    return;
  }

  const dialogRef = this.dialog.open(
    PaySupplierComponent,
    {
      width: '1200px',
      maxWidth: '98vw',
      height: '90vh',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      data: {
        supplier: supplier,
        proveedorId: supplier.id
      }
    }
  );

  dialogRef.afterClosed().subscribe(() => {
    console.log(
      'Pay Supplier cerrado para proveedor:',
      supplier.name
    );
  });
}
}
