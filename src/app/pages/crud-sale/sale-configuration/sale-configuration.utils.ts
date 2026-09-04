import {
  MeasurementDimension,
  UnitOfMeasure,
  ProductPresentation,
  ProductSaleConfiguration,
  ProductVariant,
} from '../../../interfaces/inventory';
export function isAdvancedProduct(c: ProductSaleConfiguration): boolean {
  return (
    !!c.unit &&
    (c.presentations.some((p) => p.saleEnabled) ||
      c.fractionable ||
      (c.allowedUnits?.length ?? 0) > 1 ||
      c.variantStockManaged ||
      c.variants.length > 0 ||
      c.unit.dimension !== 'COUNT')
  );
}
export interface QuickQuantityOption {
  quantity: number;
  unitId: number;
  label: string;
}
export function applyQuickQuantity<T extends { quantity: number | string; selectedUnitId: number | null }>(
  state: T,
  option: QuickQuantityOption,
): T {
  return { ...state, quantity: option.quantity, selectedUnitId: option.unitId };
}
export function normalizeDecimalInput(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) ? quantity : null;
}
export function manualQuantityValid(quantity: unknown, fractionable: boolean): boolean {
  const value = normalizeDecimalInput(quantity);
  return value != null && value > 0 && (fractionable || Number.isInteger(value));
}
const normalized = (value = '') => value.trim().toLocaleLowerCase().replace('.', '');
const findUnit = (units: UnitOfMeasure[], symbols: string[]) =>
  units.find((unit) => symbols.includes(normalized(unit.symbol)));
export function quickQuantityOptions(
  dimension: MeasurementDimension,
  units: UnitOfMeasure[],
): QuickQuantityOption[] {
  const options: QuickQuantityOption[] = [];
  const add = (unit: UnitOfMeasure | undefined, quantities: number[]) => {
    if (unit) quantities.forEach(quantity => options.push({
      quantity, unitId: unit.id, label: `${quantity} ${unit.symbol}`.trim(),
    }));
  };
  if (dimension === 'WEIGHT') {
    add(findUnit(units, ['g', 'gr']), [100, 200, 250, 500]);
    add(findUnit(units, ['kg']), [1]);
  } else if (dimension === 'LENGTH') {
    add(findUnit(units, ['cm']), [10, 25, 50]);
    add(findUnit(units, ['m', 'mt']), [1, 2]);
  } else if (dimension === 'VOLUME') {
    add(findUnit(units, ['ml']), [100, 250, 500]);
    add(findUnit(units, ['l', 'lt']), [1]);
  } else if (dimension === 'COUNT') {
    add(units[0], [1, 2, 3, 5, 10]);
  }
  return options;
}
export function unitConversionFactor(input: UnitOfMeasure | null, base: UnitOfMeasure | null): number | null {
  if (!input || !base || input.dimension !== base.dimension) return null;
  const inputFactor = Number(input.baseConversionFactor);
  const baseFactor = Number(base.baseConversionFactor);
  return inputFactor > 0 && baseFactor > 0 ? inputFactor / baseFactor : null;
}
export function baseQuantity(
  quantity: number,
  presentation?: ProductPresentation | null,
): number {
  return quantity * (presentation?.conversionFactor || 1);
}
export function estimatedTotal(
  quantity: number,
  fallbackPrice: number,
  presentation?: ProductPresentation | null,
  variant?: ProductVariant | null,
): number {
  return (
    quantity *
    Number(variant?.salePrice ?? presentation?.salePrice ?? fallbackPrice)
  );
}
export function cartIdentity(
  productId: number,
  presentationId?: number | null,
  variantId?: number | null,
  inputUnitId?: number | null,
): string {
  return `${productId}:${presentationId || 0}:${variantId || 0}:${inputUnitId || 0}`;
}
export function validVariants(
  variants: ProductVariant[],
  selected: Record<string, string>,
  attribute: string,
): ProductVariant[] {
  return variants.filter(
    (v) =>
      v.active &&
      Object.entries(selected).every(
        ([key, value]) =>
          key === attribute || !value || v.attributes[key] === value,
      ),
  );
}
export function saleDetailPayload(item: {
  id: number;
  quantity: number;
  advancedSale?: boolean;
  presentationId?: number | null;
  variantId?: number | null;
  inputUnitId?: number | null;
}) {
  return item.advancedSale
    ? {
        idProduct: item.id,
        quantity: item.quantity,
        inputUnitId: item.presentationId ? null : (item.inputUnitId ?? null),
        presentationId: item.presentationId ?? null,
        variantId: item.variantId ?? null,
      }
    : { idProduct: item.id, amount: item.quantity };
}
export function hasEnoughStock(requestedBase: number, available: number) {
  return requestedBase > 0 && requestedBase <= available;
}
