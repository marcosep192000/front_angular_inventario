import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Supplier } from '../../../../interfaces/supplier';
import { SupplierService } from '../../../../services/supplier.service';
import { FormSupplierComponent } from '../form-supplier.component';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogGenericComponent } from '../../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PaySupplierComponent } from '../../pay-supplier/pay-supplier/pay-supplier.component';
import { RegisterIncomeSupplierComponent } from "../../register-income-supplier/register-income-supplier/register-income-supplier.component";
import { IconComponent } from "../../../../shared/dasboard/icon/icon.component";
import { RegistrarFacturaProveedorComponent } from "../../registrar-factura-proveedor/registrar-factura-proveedor.component";

@Component({
  selector: 'app-list-supplier',
  standalone: true,
  imports: [
    MatTabsModule,
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
    PaySupplierComponent,
    IconComponent,
    RegistrarFacturaProveedorComponent
],

  templateUrl: './list-supplier.component.html',
  styleUrl: './list-supplier.component.css',
})
export class ListSupplierComponent implements OnInit {
  suppliers: Supplier[] = [];
  displayedColumns: string[] = [
    'id',
    'cuit',
    'name',
    'email',
    'phone',
    'contact',
    'Opciones',
  ];
  dataSource = new MatTableDataSource<Supplier>(this.suppliers);

  constructor(
    private supplierService: SupplierService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getSuppliers();
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // crear un proveedor
  createSupplier() {
    const dialogRef = this.dialog.open(FormSupplierComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'createSupplier',
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getSuppliers();
    });
  }
  // fin nuevo proveedor

  //modificar proveedor
  updateSupplier(id: number) {
    const dialogRef = this.dialog.open(FormSupplierComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        tipo: 'updateSupplier',
        updateSupplier: id,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getSuppliers();
    });
  }

  // fin actualizar proveedor

  deleteSupplier(id: number): void {
    const dialogRef = this.dialog.open(DialogGenericComponent, {
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        component: 'updateProduct', // O cualquier otro componente relevante
        data: `Eliminar`, // Aquí pasas el mensaje
        state: 'Eliminar',
        icon: 'delete', // Ícono que quieres mostrar
        message: `¿Estás seguro de eliminar el proveedor con ID ${id}?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.supplierService.deleteSupplier(id).subscribe((result) => {
          console.log(result);
          this.getSuppliers();
        });
      } else {
        // no se ha borrado el proveedor
      }
    });
  }
  getSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe((suppliers) => {
      this.suppliers = suppliers;
      this.dataSource.data = suppliers;
      console.log(suppliers);
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(FormSupplierComponent, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getSuppliers();
    });
  }
}
