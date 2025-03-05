export interface Marca {
  id: number;
  marca: string;
}

export interface ProductItemBuy {
  barCode: string;
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  stockMin: number;
  iva: number;
  marca: Marca;
  quantity: number;
  precioTotal: number;
  totalStock: number;
}
