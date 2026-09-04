import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import {
  ProductPresentationRequest,
  ProductSaleConfiguration,
  UnitOfMeasure,
  VariantAttribute,
  VariantAttributeValue,
} from '../../../interfaces/inventory';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from '../../../services/product.service';
import {
  baseUnitRequest,
  inventoryBaseFormState,
  InventoryBaseFormState,
} from './inventory-config.utils';

@Component({
  selector: 'app-inventory-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './inventory-config.component.html',
  styleUrl: './inventory-config.component.css',
})
export class InventoryConfigComponent implements OnInit {
  units: UnitOfMeasure[] = [];
  config: ProductSaleConfiguration | null = null;
  attributes: VariantAttribute[] = [];
  values: Record<number, VariantAttributeValue[]> = {};
  loading = true;
  saving = false;
  base: InventoryBaseFormState = {
    unitId: null as number | null,
    stock: 0,
    minimumStock: 0,
    fractionable: false,
    variantStockManaged: false,
  };
  presentation: ProductPresentationRequest = {
    name: '',
    unitId: 0,
    conversionFactor: 1,
    purchaseEnabled: false,
    saleEnabled: true,
    defaultSale: false,
    barcode: null,
    salePrice: null,
    purchasePrice: null,
  };
  variant = {
    sku: '',
    barcode: '',
    stock: 0,
    salePrice: null as number | null,
    purchasePrice: null as number | null,
    selected: {} as Record<number, number | null>,
  };
  newAttribute = '';
  newValue: Record<number, string> = {};
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      productId: number;
      productName: string;
      stock: number;
      stockMin: number;
    },
    private api: InventoryService,
    private productApi: ProductService,
    private toast: ToastrService,
    public ref: MatDialogRef<InventoryConfigComponent>,
  ) {}
  ngOnInit() {
    this.reload();
  }
  reload() {
    this.loading = true;
    forkJoin({
      units: this.api.getUnits(),
      config: this.api.getSaleConfiguration(this.data.productId),
      attributes: this.api.getAttributes(),
    }).subscribe({
      next: (r) => {
        this.units = r.units.map((unit) => ({ ...unit, id: Number(unit.id) }));
        this.config = r.config;
        this.attributes = r.attributes;
        this.base = inventoryBaseFormState(r.config, this.data);
        this.loadValues();
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.showError(e, 'No se pudo cargar la configuración del producto.');
      },
    });
  }
  loadValues() {
    this.attributes.forEach((a) =>
      this.api
        .getAttributeValues(a.id)
        .subscribe((v) => (this.values[a.id] = v)),
    );
  }
  saveBase() {
    const request = baseUnitRequest(this.base);
    if (!request || this.saving) return;
    this.saving = true;
    this.api
      .updateBaseUnit(this.data.productId, request)
      .pipe(
        switchMap(() => this.productApi.findById(this.data.productId)),
        switchMap((product) => {
          const stock = Number(this.base.stock);
          const stockMin = Number(this.base.minimumStock);
          // El DTO legado sólo admite enteros. Para stock fraccionable,
          // updateBaseUnit es la fuente definitiva y no debe degradarse.
          if (!Number.isInteger(stock) || !Number.isInteger(stockMin)) {
            return of(product);
          }
          return this.productApi.update(this.data.productId, {
            ...product,
            category: product.category.id,
            marca: product.marca.id,
            provider: product.provider.id,
            stock: Math.max(0, stock),
            stockMin: Math.max(0, stockMin),
          } as any);
        }),
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          const stock = Math.max(0, Number(this.base.stock));
          const stockMin = Math.max(0, Number(this.base.minimumStock));
          this.toast.success('Unidad y stock actualizados correctamente.');
          this.ref.close({ changed: true, stock, stockMin });
        },
        error: (e) => {
          this.showError(e, 'No se pudo guardar la unidad base.');
        },
      });
  }
  addPresentation() {
    if (
      !this.presentation.name.trim() ||
      !this.presentation.unitId ||
      this.presentation.conversionFactor <= 0
    )
      return;
    this.saving = true;
    this.api
      .createPresentation(this.data.productId, this.presentation)
      .subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Presentación agregada.');
          this.presentation = {
            name: '',
            unitId: 0,
            conversionFactor: 1,
            purchaseEnabled: false,
            saleEnabled: true,
            defaultSale: false,
            barcode: null,
            salePrice: null,
            purchasePrice: null,
          };
          this.reload();
        },
        error: (e) => {
          this.saving = false;
          this.showError(e, 'No se pudo agregar la presentación.');
        },
      });
  }
  deletePresentation(id: number) {
    this.api.deletePresentation(id).subscribe({
      next: () => {
        this.toast.success('Presentación desactivada.');
        this.reload();
      },
      error: (e) => this.showError(e, 'No se pudo desactivar la presentación.'),
    });
  }
  createAttribute() {
    if (!this.newAttribute.trim()) return;
    this.api.createAttribute(this.newAttribute).subscribe({
      next: () => {
        this.newAttribute = '';
        this.reload();
      },
      error: (e) => this.showError(e, 'No se pudo crear el atributo.'),
    });
  }
  createValue(attributeId: number) {
    const value = this.newValue[attributeId]?.trim();
    if (!value) return;
    this.api.createAttributeValue(attributeId, value).subscribe({
      next: () => {
        this.newValue[attributeId] = '';
        this.loadValues();
      },
      error: (e) => this.showError(e, 'No se pudo crear el valor.'),
    });
  }
  addVariant() {
    const ids = Object.values(this.variant.selected).filter(
      (id): id is number => !!id,
    );
    if (!this.variant.sku.trim() || !ids.length) return;
    this.saving = true;
    this.api
      .createVariant(this.data.productId, {
        sku: this.variant.sku,
        barcode: this.variant.barcode || null,
        stock: Number(this.variant.stock),
        salePrice: this.variant.salePrice,
        purchasePrice: this.variant.purchasePrice,
        attributeValueIds: ids,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Variante agregada.');
          this.variant = {
            sku: '',
            barcode: '',
            stock: 0,
            salePrice: null,
            purchasePrice: null,
            selected: {},
          };
          this.reload();
        },
        error: (e) => {
          this.saving = false;
          this.showError(e, 'No se pudo crear la variante.');
        },
      });
  }
  deleteVariant(id: number) {
    this.api.deleteVariant(id).subscribe({
      next: () => {
        this.toast.success('Variante desactivada.');
        this.reload();
      },
      error: (e) => this.showError(e, 'No se pudo desactivar la variante.'),
    });
  }
  equivalence(p: any) {
    return `1 ${p.name} = ${p.conversionFactor} ${this.config?.unit?.symbol || 'un.'}`;
  }
  attributesLabel(attributes: Record<string, string>): string {
    return Object.entries(attributes)
      .map(([name, value]) => `${name}: ${value}`)
      .join(' · ');
  }
  close(): void {
    this.ref.close();
  }
  private showError(e: any, fallback: string) {
    this.toast.error(e?.error?.message || e?.error?.error || fallback);
  }
}
