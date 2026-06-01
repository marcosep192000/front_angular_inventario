import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

import { ProductService } from '../../../services/product.service';
import { Product } from '../../../interfaces/Product';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormProductComponent } from '../form-product/form-product.component';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { IconComponent } from '../../../shared/dasboard/icon/icon.component';
import { AddExcelListProductComponent } from '../add-excel-list-product/add-excel-list-product.component';
import { BuscarProductoPorProveedorComponent } from '../buscar-producto-por-proveedor/buscar-producto-por-proveedor.component';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-list-product',
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
    MatTooltipModule,
    IconComponent,
    MatMenuModule
  ],
  templateUrl: './list-product.component.html',
  styleUrl: './list-product.component.css',
})
export class ListProductComponent implements OnInit{

// busqueda 
searchTerm = '';
private searchSubject = new Subject<string>();


form!: FormGroup;
pageSize = 10;
pageIndex = 0;  
totalElements = 0;
  displayedColumns: string[] = [
    'barCode',
    'name',
    'provider',
    'salePrice',
    'stock',
    'fechaUltimaActualizacion',
    'Opciones',
  ];

  dataSource = new MatTableDataSource<Product>([]);


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    public dialog: MatDialog
  ) {}

ngOnInit(): void {
  this.getProducts(0, this.pageSize);

  this.searchSubject
    .pipe(
      debounceTime(400),
      distinctUntilChanged()
    )
    .subscribe(value => {
      this.searchTerm = value;
      this.pageIndex = 0;
      this.getProducts(0, this.pageSize, this.searchTerm);
    });
}
applyFilter(event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.trim().toLowerCase();

  // ⚠️ IMPORTANTE: con paginación BACKEND
  // acá deberías llamar al backend
  this.getProducts(0, this.pageSize /*, value */);
}


  // ============================
  // 📦 CARGA CON PAGINACIÓN BACKEND
  // ============================
 getProducts(
  page: number = 0,
  size: number = 10,
  search: string = ''
): void {
  this.productService.getProducts(page, size, search).subscribe({
    next: (res) => {
      this.dataSource.data = res.content;
      this.totalElements = res.totalElements;
      this.pageIndex = page;
    },
    error: (err) => {
      console.error('Error al cargar productos', err);
    }
  });
}


onPageChange(event: PageEvent): void {
  this.pageSize = event.pageSize;
  this.pageIndex = event.pageIndex;

  this.getProducts(
    this.pageIndex,
    this.pageSize,
    this.searchTerm
  );
}


  // ============================
  // ➕ CREAR
  // ============================
  createProduct(): void {
    const dialogRef = this.dialog.open(FormProductComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      data: { tipo: 'createProduct' },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getProducts(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  // ============================
  // ✏️ EDITAR
  // ============================
  updateProduct(id: number): void {
    const dialogRef = this.dialog.open(FormProductComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      data: {
        tipo: 'updateProduct',
        updateProduct: id,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getProducts(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  // ============================
  // 📥 IMPORTAR EXCEL
  // ============================
  addExcelListProduct(): void {
    const dialogRef = this.dialog.open(AddExcelListProductComponent, {
      autoFocus: true,
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getProducts(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  // ============================
  // 🔍 ACCIONES
  // ============================
  accionesProduct(): void {
const dialogRef = this.dialog.open(BuscarProductoPorProveedorComponent, {
      autoFocus: true,
      hasBackdrop: true,
    });
  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      this.getProducts(this.pageIndex, this.pageSize, this.searchTerm);
    }
   })
  }
  // ============================
  // 🗑️ ELIMINAR
  // ============================
  deleteProduct(id: number): void {
    const dialogRef = this.dialog.open(DialogGenericComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      data: {
        state: 'Eliminar',
        icon: 'delete',
        message: `¿Estás seguro de eliminar el producto con ID ${id}?`,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.productService.delete(id).subscribe(() => {
          this.getProducts(this.paginator.pageIndex, this.paginator.pageSize);
        });
      }
    });
  }

onSearchChange(value: string): void {
  this.searchSubject.next(value);
}
filterValue: string = '';

onFilter(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.filterValue = value;

  // Siempre volver a la primera página
  this.pageIndex = 0;

  this.getProducts(0, this.pageSize, this.filterValue);
}
 
}
