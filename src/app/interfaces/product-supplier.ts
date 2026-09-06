export interface ProductSupplier {
  id: number;
  productId: number;
  productName?: string | null;
  productBarcode?: string | null;
  providerId: number;
  providerName: string;
  supplierProductCode: string | null;
  supplierBarcode: string | null;
  purchasePrice: number | null;
  lastPurchasePrice: number | null;
  preferred: boolean;
  active: boolean;
  found?: boolean;
}

export interface ProductSupplierRequest {
  providerId: number;
  supplierProductCode: string | null;
  supplierBarcode: string | null;
  purchasePrice: number | null;
  lastPurchasePrice: number | null;
  preferred: boolean;
  active: boolean | null;
}
