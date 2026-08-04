export interface Product {
  id: number;
  name: string;
  stock: number;
  selected?: boolean; // para checkbox
}
export interface LowStockByProvider {
  name: string;
  products: Product[]; id: number;
  stockMin: number;
  stock: number;
  selected?: boolean;
}
