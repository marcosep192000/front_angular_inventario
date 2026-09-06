import { ProductSupplier } from '../../../interfaces/product-supplier';

export interface SupplierLineIdentity {
  productId: number;
  productSupplierId: number | null;
  supplierProductCode: string | null;
  supplierBarcode: string | null;
  linkExistingProduct: boolean;
  supplierLinked: boolean;
}

export function buildSupplierLineIdentity(
  productId: number,
  supplierProductCode: string | null,
  relation: ProductSupplier | null,
  linkExistingProduct: boolean,
): SupplierLineIdentity {
  return {
    productId,
    productSupplierId: relation?.id ?? null,
    supplierProductCode: supplierProductCode?.trim() || null,
    supplierBarcode: relation?.supplierBarcode ?? null,
    linkExistingProduct,
    supplierLinked: !!relation || linkExistingProduct,
  };
}

export function supplierInvoiceErrorMessage(error: any, fallback: string): string {
  const code = error?.error?.code ?? error?.error?.error;
  const messages: Record<string, string> = {
    SUPPLIER_PRODUCT_NOT_FOUND: 'El código no está asociado a ningún producto para este proveedor.',
    PROVIDER_MISMATCH: 'El artículo pertenece a otro proveedor.',
    PRODUCT_SUPPLIER_MISMATCH: 'El producto no coincide con la relación del proveedor.',
    INACTIVE_PRODUCT_SUPPLIER: 'La relación con este proveedor está desactivada.',
  };
  return messages[code] || error?.error?.message || fallback;
}
