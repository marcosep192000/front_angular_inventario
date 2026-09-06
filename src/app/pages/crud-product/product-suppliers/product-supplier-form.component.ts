import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ProductSupplier, ProductSupplierRequest } from '../../../interfaces/product-supplier';
import { Supplier } from '../../../interfaces/supplier';
import { ProductSupplierService } from '../../../services/product-supplier.service';
import { SupplierService } from '../../../services/supplier.service';

@Component({
  selector: 'app-product-supplier-form', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSlideToggleModule],
  templateUrl: './product-supplier-form.component.html',
  styleUrl: './product-supplier-form.component.css',
})
export class ProductSupplierFormComponent implements OnInit {
  suppliers: Supplier[] = [];
  loadingSuppliers = true;
  saving = false;
  readonly form = this.fb.group({
    providerId: [null as number | null, Validators.required],
    supplierProductCode: [''], supplierBarcode: [''],
    purchasePrice: [null as number | null, Validators.min(0)],
    lastPurchasePrice: [null as number | null, Validators.min(0)],
    preferred: [false],
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      productId: number; relation?: ProductSupplier; associatedProviderIds: number[];
    }, private fb: FormBuilder, private api: ProductSupplierService,
    private suppliersApi: SupplierService, private toast: ToastrService,
    public ref: MatDialogRef<ProductSupplierFormComponent>,
  ) {}
  ngOnInit(): void {
    if (this.data.relation) {
      this.form.patchValue(this.data.relation);
      this.form.controls.providerId.disable();
    }
    this.suppliersApi.getAllSuppliers().subscribe({
      next: suppliers => { this.suppliers = suppliers; this.loadingSuppliers = false; },
      error: () => { this.loadingSuppliers = false; this.toast.error('No se pudieron cargar los proveedores.'); },
    });
  }
  isAssociated(providerId?: number): boolean {
    return providerId != null && !this.data.relation && this.data.associatedProviderIds.includes(providerId);
  }
  save(): void {
    if (this.saving || this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const request: ProductSupplierRequest = {
      providerId: Number(value.providerId),
      supplierProductCode: value.supplierProductCode?.trim() || null,
      supplierBarcode: value.supplierBarcode?.trim() || null,
      purchasePrice: value.purchasePrice == null ? null : Number(value.purchasePrice),
      lastPurchasePrice: value.lastPurchasePrice == null ? null : Number(value.lastPurchasePrice),
      preferred: value.preferred === true,
      active: this.data.relation?.active ?? true,
    };
    this.saving = true;
    const operation = this.data.relation
      ? this.api.update(this.data.relation.id, request)
      : this.api.create(this.data.productId, request);
    operation.pipe(finalize(() => (this.saving = false))).subscribe({
      next: relation => {
        this.toast.success(this.data.relation ? 'Proveedor actualizado correctamente.' : 'Proveedor agregado correctamente.');
        this.ref.close({ saved: true, data: relation });
      },
      error: error => this.showError(error),
    });
  }
  private showError(error: HttpErrorResponse): void {
    const code = error.error?.code ?? error.error?.error;
    const field = error.error?.field;
    let message = error.error?.message;
    if (field === 'providerId') message = 'Este proveedor ya está asociado al producto.';
    if (field === 'supplierProductCode' && !message) {
      const supplierCode = this.form.controls.supplierProductCode.value?.trim();
      message = supplierCode
        ? `El código ${supplierCode} ya está asociado a otro producto para este proveedor.`
        : 'El código interno ya está asociado a otro producto para este proveedor.';
    }
    this.toast.error(message || code || 'No se pudo guardar el proveedor del producto.');
  }
}
