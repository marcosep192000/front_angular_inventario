export const COST_ALERT_LABELS: Record<string, string> = {
  NO_SUPPLIER: 'Sin proveedor', NO_LAST_PURCHASE_PRICE: 'Sin último costo de compra',
  ONLY_ONE_SUPPLIER: 'Único proveedor', NO_PREFERRED_SUPPLIER: 'Sin proveedor preferido',
  PREFERRED_WITHOUT_PRICE: 'Preferido sin último costo', PREFERRED_NOT_CHEAPEST: 'Preferido no es el más barato',
};
export function costAlertLabel(type: string): string { return COST_ALERT_LABELS[type] ?? type.replaceAll('_', ' '); }
export function reportErrorMessage(error: any): string {
  if (error?.status === 403) return 'No tiene permisos para ver reportes de proveedores.';
  if (error?.status === 404) return 'Producto o proveedor no encontrado.';
  if (error?.status === 400) return error?.error?.message || 'Revisá los filtros ingresados.';
  return 'No se pudo cargar el reporte. Intentá nuevamente.';
}
export function nullableValue<T>(value: T | null | undefined, fallback = 'Sin información comparable'): T | string { return value == null ? fallback : value; }
