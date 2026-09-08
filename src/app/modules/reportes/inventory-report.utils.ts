const quantityFields = new Set([
  'availableStock', 'minimumStock', 'unidadesStock', 'unidadesInmovilizadas',
  'diferencia', 'ventasUltimos30Dias',
]);
const compatibilityFields = new Set(['stock', 'stockMin', 'stockActual', 'stockMinimo']);
export function inventoryQuantityField(field: string): boolean { return quantityFields.has(field); }
export function inventoryColumns(row: Record<string, unknown>): string[] {
  // Transitional aliases can remain on the wire; the modern UI never displays them.
  return Object.keys(row).filter(field => !compatibilityFields.has(field));
}
export function formatInventoryQuantity(value: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 6 }).format(value);
}
