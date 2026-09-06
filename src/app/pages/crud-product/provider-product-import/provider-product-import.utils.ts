import {
  ProviderProductImportMapping,
  ProviderProductImportStatus,
} from '../../../interfaces/provider-product-import';
const find = (h: string[], patterns: RegExp[]) =>
  h.find((x) => patterns.some((p) => p.test(x.trim().toLocaleLowerCase()))) ??
  null;
export function autoMapProviderProduct(
  headers: string[],
): ProviderProductImportMapping {
  return {
    sheet: null,
    headerRow: 0,
    supplierProductCodeColumn:
      find(headers, [/^codigo$/, /^código$/, /^codigo proveedor$/, /^sku$/]) ??
      '',
    supplierBarcodeColumn: find(headers, [
      /barcode proveedor/,
      /código de barras proveedor/,
    ]),
    productBarcodeColumn: find(headers, [
      /^barcode producto$/,
      /^código de barras producto$/,
    ]),
    nameColumn:
      find(headers, [
        /^descripcion$/,
        /^descripción$/,
        /^detalle$/,
        /^producto$/,
      ]) ?? '',
    ivaColumn: find(headers, [/^iva$/]),
    purchasePriceColumn:
      find(headers, [/^precio$/, /^costo$/, /^precio neto$/]) ?? '',
    profitPercentageColumn: find(headers, [
      /^utilidad-ganancia$/,
      /^utilidad$/,
      /^ganancia$/,
    ]),
  };
}
export const providerImportFileAccepted = (f: File) =>
  /\.(xlsx|xls)$/i.test(f.name);
export const uiRowToBackend = (n: number) =>
  Math.max(0, Math.floor(Number(n) || 1) - 1);
export const backendRowToUi = (n: number) => n + 1;
export const statusLabel = (s: ProviderProductImportStatus) =>
  ({
    NEW_PRODUCT: 'Nuevo',
    ALREADY_LINKED: 'Ya vinculado',
    LINK_EXISTING_REQUIRED: 'Requiere revisión',
    INVALID: 'Error',
  })[s];
export const commercialMoney = (v: number | null) =>
  v == null
    ? '—'
    : new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v);
export const percentage = (v: number | null) =>
  v == null
    ? '—'
    : `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(v)} %`;
