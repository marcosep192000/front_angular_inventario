import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { ProductSupplier } from '../../../interfaces/product-supplier';
import { ProductSupplierService } from '../../../services/product-supplier.service';
import { DialogGenericComponent } from '../../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { ProductSupplierFormComponent } from './product-supplier-form.component';

@Component({ selector: 'app-product-suppliers-dialog', standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
  templateUrl: './product-suppliers-dialog.component.html', styleUrl: './product-suppliers-dialog.component.css' })
export class ProductSuppliersDialogComponent implements OnInit {
  relations: ProductSupplier[] = []; loading = true; processingId: number | null = null; changed = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { productId: number; productName: string },
    private api: ProductSupplierService, private dialog: MatDialog, private toast: ToastrService,
    public ref: MatDialogRef<ProductSuppliersDialogComponent>) {}
  ngOnInit(): void { this.load(); }
  get activeRelations(): ProductSupplier[] { return this.relations.filter(item => item.active); }
  load(): void { this.loading = true; this.api.getByProduct(this.data.productId).subscribe({
    next: data => { this.relations = data; this.loading = false; },
    error: e => { this.loading = false; this.error(e, 'No se pudieron cargar los proveedores del producto.'); },
  }); }
  openForm(relation?: ProductSupplier): void {
    this.dialog.open(ProductSupplierFormComponent, { width: '650px', maxWidth: '95vw', disableClose: true,
      data: { productId: this.data.productId, relation, associatedProviderIds: this.relations.map(item => item.providerId) } })
      .afterClosed().subscribe(result => { if (result?.saved) { this.changed = true; this.load(); } });
  }
  prefer(relation: ProductSupplier): void {
    if (relation.preferred || this.processingId != null) return; this.processingId = relation.id;
    this.api.setPreferred(relation.id).subscribe({ next: () => { this.processingId = null; this.changed = true;
      this.toast.success('Proveedor preferido actualizado.'); this.load(); }, error: e => { this.processingId = null; this.error(e, 'No se pudo cambiar el proveedor preferido.'); } });
  }
  deactivate(relation: ProductSupplier): void {
    this.dialog.open(DialogGenericComponent, { width: '440px', data: { state: 'Desactivar proveedor', icon: 'warning',
      message: `¿Desactivar a ${relation.providerName} para este producto?` } }).afterClosed().subscribe(ok => {
      if (ok !== true || this.processingId != null) return; this.processingId = relation.id;
      this.api.deactivate(relation.id).subscribe({ next: () => { this.processingId = null; this.changed = true;
        this.toast.success('Proveedor desactivado correctamente.'); this.load(); }, error: e => { this.processingId = null; this.error(e, 'No se pudo desactivar el proveedor.'); } });
    });
  }
  close(): void { this.ref.close(this.changed ? { changed: true } : undefined); }
  private error(error: HttpErrorResponse, fallback: string): void { this.toast.error(error.error?.message || error.error?.error || fallback); }
}
