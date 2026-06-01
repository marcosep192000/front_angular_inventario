import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { SupplierService } from '../../../services/supplier.service';
import { MarcaService } from '../../../services/marca.service';
import { CategoryService } from '../../../services/category.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-price-massive-update',
  standalone: true,
  templateUrl: './buscar-producto-por-proveedor.component.html',
  styleUrls: ['./buscar-producto-por-proveedor.component.scss'],
  imports: [
       // 🔥 ESTO ES LO QUE FALTABA
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class BuscarProductoPorProveedorComponent implements OnInit {

  form!: FormGroup;

  referencias: any[] = [];
  mostrarComboReferencia = false;
  labelReferencia = '';

  displayedColumns = ['select', 'name', 'price', 'salePrice', 'preview','fechaUltimaActualizacion'];
  dataSource = new MatTableDataSource<any>([]);
  selectedProducts = new Set<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private proveedorService: SupplierService,
    private marcaService: MarcaService,
    private categoriaService: CategoryService,  private dialogRef: MatDialogRef<BuscarProductoPorProveedorComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      criterio: ['PROVEEDOR', Validators.required],
      referenciaId: [null, Validators.required],
      tipoCambio: ['AUMENTO', Validators.required],
      aplicaA: ['VENTA', Validators.required],
      porcentaje: [null, [Validators.required, Validators.min(0.01)]]
    });

    this.onCriterioChange();
  }

  onCriterioChange(): void {
    const criterio = this.form.value.criterio;

    this.referencias = [];
    this.dataSource.data = [];
    this.selectedProducts.clear();

    if (criterio === 'PROVEEDOR') {
      this.labelReferencia = 'Proveedor';
      this.proveedorService.getAllSuppliers().subscribe(r => this.referencias = r);
    }

    if (criterio === 'MARCA') {
      this.labelReferencia = 'Marca';
      this.marcaService.allMarca().subscribe(r => this.referencias = r);
    }

    if (criterio === 'CATEGORIA') {
      this.labelReferencia = 'Categoría';
      this.categoriaService.getCategories().subscribe(r => this.referencias = r);
    }

    this.mostrarComboReferencia = true;
  }

  cargarProductos(): void {
    const { criterio, referenciaId } = this.form.value;
    if (!referenciaId) return;

    if (criterio === 'PROVEEDOR') {
      this.productService.getProductoPorProveedor(referenciaId).subscribe(p => {
        this.dataSource.data = p;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }
  }

  toggleAll(event: any): void {
    if (event.checked) {
      this.dataSource.data.forEach(p => this.selectedProducts.add(p.id));
    } else {
      this.selectedProducts.clear();
    }
  }

  toggleProduct(p: any): void {
    this.selectedProducts.has(p.id)
      ? this.selectedProducts.delete(p.id)
      : this.selectedProducts.add(p.id);
  }

  isSelected(p: any): boolean {
    return this.selectedProducts.has(p.id);
  }

  isAllSelected(): boolean {
    return this.selectedProducts.size === this.dataSource.data.length;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  previewPrice(p: any): number {
    const porcentaje = this.form.value.porcentaje;
    if (!porcentaje) return p.salePrice;

    const factor = this.form.value.tipoCambio === 'AUMENTO'
      ? 1 + porcentaje / 100
      : 1 - porcentaje / 100;

    return this.form.value.aplicaA === 'VENTA'
      ? p.salePrice * factor
      : p.price * factor;
  }

aplicarCambio(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (this.selectedProducts.size === 0) {
    alert('⚠️ Debe seleccionar al menos un producto');
    return;
  }

  const payload = {
    ...this.form.value,
    productosIds: Array.from(this.selectedProducts)
  };

  this.productService.actualizarPreciosMasivo(payload)
    .subscribe({
      next: () => {
        alert('✅ Precios actualizados correctamente');
        this.dialogRef.close(true);
      },
      error: err => {
        console.error(err);
        alert('❌ Error al actualizar precios');
      }
    });
}

}
