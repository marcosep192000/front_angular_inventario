import { Category } from "./Category";
import { Marca } from "./marca";
import { Supplier } from "./supplier";

export interface Product {
  id?: number;
  marca: Marca;
  category: Category;
  provider: Supplier;
  name: string;
  price: Float32Array;
  stock: number;
  iva: number;
  stateIva: boolean;
  stockMin: number;
  image: string;
  expiration: number;
  salePrice: Float32Array;
  productUsefulness: Float32Array;
  barCode: string;
  status: boolean ; 
}
