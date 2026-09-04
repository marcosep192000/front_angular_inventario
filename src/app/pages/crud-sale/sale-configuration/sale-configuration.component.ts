import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
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
import {
  InventorySaleSelection,
  ProductPresentation,
  ProductSaleConfiguration,
  ProductVariant,
  UnitOfMeasure,
} from '../../../interfaces/inventory';
import { ProductItemSale } from '../../../interfaces/ProductItemSale';
import {
  estimatedTotal,
  QuickQuantityOption,
  applyQuickQuantity,
  manualQuantityValid,
  normalizeDecimalInput,
  quickQuantityOptions,
  unitConversionFactor,
  validVariants,
} from './sale-configuration.utils';

@Component({
  selector: 'app-sale-configuration',
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
  ],
  templateUrl: './sale-configuration.component.html',
  styleUrl: './sale-configuration.component.css',
})
export class SaleConfigurationComponent {
  quantity: number | string = 1;
  presentationId: number | null = null;
  selectedUnitId: number | null = null;
  selectedAttributes: Record<string, string> = {};
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { product: ProductItemSale; config: ProductSaleConfiguration },
    private ref: MatDialogRef<SaleConfigurationComponent>,
  ) {
    this.presentationId =
      data.config.presentations.find((p) => p.defaultSale && p.saleEnabled)
        ?.id ?? null;
    const allowed = data.config.allowedUnits ?? [];
    this.selectedUnitId = allowed.some(u => u.id === data.config.unit?.id)
      ? data.config.unit!.id
      : (allowed[0]?.id ?? data.config.unit?.id ?? null);
  }
  get presentations() {
    return this.data.config.presentations.filter(
      (p) => p.active && p.saleEnabled,
    );
  }
  get presentation(): ProductPresentation | null {
    return this.presentations.find((p) => p.id === this.presentationId) || null;
  }
  get allowedUnits(): UnitOfMeasure[] {
    return this.data.config.allowedUnits ?? [];
  }
  get selectedUnit(): UnitOfMeasure | null {
    return this.allowedUnits.find(unit => unit.id === this.selectedUnitId)
      ?? this.data.config.unit;
  }
  get quickOptions(): QuickQuantityOption[] {
    if (this.presentation) return [];
    const dimension = this.data.config.unit?.dimension;
    return dimension ? quickQuantityOptions(dimension, this.allowedUnits) : [];
  }
  selectQuickQuantity(option: QuickQuantityOption): void {
    const next = applyQuickQuantity(
      { quantity: this.quantity, selectedUnitId: this.selectedUnitId }, option,
    );
    this.quantity = next.quantity;
    this.selectedUnitId = next.selectedUnitId;
  }
  isQuickSelected(option: QuickQuantityOption): boolean {
    return this.selectedUnitId === option.unitId && this.numericQuantity === option.quantity;
  }
  isQuickDisabled(option: QuickQuantityOption): boolean {
    const unit = this.allowedUnits.find(item => item.id === option.unitId) ?? null;
    const factor = unitConversionFactor(unit, this.data.config.unit);
    return factor != null && option.quantity * factor > this.available;
  }
  get conversionFactor(): number | null {
    return this.presentation
      ? Number(this.presentation.conversionFactor)
      : unitConversionFactor(this.selectedUnit, this.data.config.unit);
  }
  get numericQuantity(): number | null {
    return normalizeDecimalInput(this.quantity);
  }
  get attributes(): string[] {
    return [
      ...new Set(
        this.data.config.variants
          .filter((v) => v.active)
          .flatMap((v) => Object.keys(v.attributes)),
      ),
    ];
  }
  values(attribute: string): string[] {
    return [
      ...new Set(
        validVariants(
          this.data.config.variants,
          this.selectedAttributes,
          attribute,
        )
          .map((v) => v.attributes[attribute])
          .filter(Boolean),
      ),
    ];
  }
  selectAttribute(attribute: string, value: string) {
    this.selectedAttributes[attribute] = value;
    for (const key of this.attributes) {
      if (
        key !== attribute &&
        this.selectedAttributes[key] &&
        !this.values(key).includes(this.selectedAttributes[key])
      )
        delete this.selectedAttributes[key];
    }
  }
  get variant(): ProductVariant | null {
    return (
      this.data.config.variants.find(
        (v) =>
          v.active &&
          this.attributes.every(
            (a) => v.attributes[a] === this.selectedAttributes[a],
          ),
      ) || null
    );
  }
  get variantRequired() {
    return (
      this.data.config.variantStockManaged ||
      this.data.config.variants.length > 0
    );
  }
  get available() {
    return Number(this.variant?.stock ?? this.data.config.stock);
  }
  get requestedBase() {
    const factor = this.conversionFactor;
    const quantity = this.numericQuantity;
    if (quantity == null) return Number.POSITIVE_INFINITY;
    return factor == null ? quantity : quantity * factor;
  }
  get total() {
    if (this.numericQuantity == null) return 0;
    return estimatedTotal(
      this.presentation ? (this.numericQuantity ?? 0) : this.requestedBase,
      this.data.product.salePrice,
      this.presentation,
      this.variant,
    );
  }
  get unitPrice() {
    return Number(
      this.variant?.salePrice ??
        this.presentation?.salePrice ??
        this.data.product.salePrice,
    );
  }
  get valid() {
    return (
      manualQuantityValid(this.quantity, this.data.config.fractionable) &&
      (!!this.presentation || !!this.selectedUnitId) &&
      (!this.variantRequired || !!this.variant) &&
      this.requestedBase <= this.available
    );
  }
  get quantityIsValid(): boolean {
    return manualQuantityValid(this.quantity, this.data.config.fractionable);
  }
  get equivalence() {
    const symbol = this.data.config.unit?.symbol || 'un.';
    return this.presentation
      ? `${this.numericQuantity} ${this.presentation.name} = ${this.requestedBase} ${symbol}`
      : this.selectedUnit && this.selectedUnit.id !== this.data.config.unit?.id && this.conversionFactor != null
        ? `${this.numericQuantity} ${this.selectedUnit.symbol} = ${this.requestedBase.toFixed(3)} ${symbol}`
        : `${this.numericQuantity ?? ''} ${this.selectedUnit?.symbol || symbol}`;
  }
  confirm() {
    if (!this.valid) return;
    const result: InventorySaleSelection = {
      quantity: this.numericQuantity!,
      inputUnitId: this.presentation ? null : this.selectedUnitId,
      presentationId: this.presentation?.id ?? null,
      variantId: this.variant?.id ?? null,
      displayQuantity: this.equivalence,
      unitPrice: this.unitPrice,
      available: this.available,
      baseQuantity: this.requestedBase,
      conversionFactor: this.conversionFactor ?? 1,
    };
    this.ref.close(result);
  }
}
