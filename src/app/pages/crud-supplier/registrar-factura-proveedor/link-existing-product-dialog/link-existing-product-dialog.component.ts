import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { Product } from '../../../../interfaces/Product';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'app-link-existing-product-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './link-existing-product-dialog.component.html',
  styleUrl: './link-existing-product-dialog.component.css',
})
export class LinkExistingProductDialogComponent {
  query = '';
  loading = false;
  searched = false;
  products: Product[] = [];
  selected: Product | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { providerName: string; supplierProductCode: string },
    private productService: ProductService,
    public dialogRef: MatDialogRef<LinkExistingProductDialogComponent>,
  ) {}

  search(): void {
    const query = this.query.trim();
    if (!query || this.loading) return;
    this.loading = true;
    this.searched = true;
    this.selected = null;
    this.productService.getProducts(0, 20, query).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: page => (this.products = page?.content ?? []),
      error: () => (this.products = []),
    });
  }

  select(product: Product): void {
    this.selected = product;
  }

  confirm(): void {
    if (this.selected) this.dialogRef.close(this.selected);
  }
}
