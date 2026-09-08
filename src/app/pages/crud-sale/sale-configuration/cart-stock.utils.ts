import { ProductItemSale } from '../../../interfaces/ProductItemSale';

/** A variant never falls back to the aggregate product stock. */
export function effectiveCartStock(item: ProductItemSale): number {
  return item.variantId != null || item.variantStockManaged
    ? (item.variantStock ?? 0) : item.availableStock;
}
export function reservedBaseStock(items: ProductItemSale[], item: Pick<ProductItemSale, 'id' | 'variantId'>): number {
  return items.filter(p => p.id === item.id && (p.variantId ?? null) === (item.variantId ?? null))
    .reduce((sum, p) => sum + (p.baseQuantity ?? p.quantity), 0);
}
export function canAddBaseStock(items: ProductItemSale[], item: ProductItemSale, additionalBase: number): boolean {
  return Number.isFinite(additionalBase) && additionalBase > 0 &&
    reservedBaseStock(items, item) + additionalBase <= effectiveCartStock(item) + 1e-9;
}
