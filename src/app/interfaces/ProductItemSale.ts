
export interface Marca {
	id: number;
	marca: string;
}

export interface ProductItemSale {
  barCode: string;
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  stockMin: number;
  iva: number;
  tipoIva?: import('./tipo-iva').TipoIva;
  salePrice: number;
  marca: Marca;
  quantity: number;
  precioTotal: number;
  totalStock: number;
}
