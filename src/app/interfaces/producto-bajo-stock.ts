export interface LowStockProduct {
  productId: number;
  name: string;
  barCode: string | null;
  availableStock: number;
  minimumStock: number;
  variantStockManaged: boolean;
  category: { id: number; name: string } | null;
  provider: { id: number; name: string } | null;
  selected?: boolean;
}
export type Product = LowStockProduct;
export interface LowStockByProvider {
  id: number | null;
  name: string;
  products: LowStockProduct[];
  selected?: boolean;
}
export interface LowStockPage {
  content: LowStockProduct[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
