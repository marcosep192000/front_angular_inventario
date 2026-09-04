import { Category } from "./Category";
import { Marca } from "./marca";
import { Supplier } from "./supplier";
import { TipoIva } from './tipo-iva';
import { UnitOfMeasure } from './inventory';

export interface Product {
  id?: number;
  marca: Marca;
  category: Category;
  provider: Supplier;
  name: string;
  price: Float32Array;
  stock: number;
  baseUnit?: UnitOfMeasure | null;
  iva: number;
  stateIva: boolean;
  tipoIva?: TipoIva;
  stockMin: number;
  image: string;
  expiration: number;
  salePrice: Float32Array;
  productUsefulness: Float32Array;
  barCode: string;
  status: boolean ; 
  fechaUltimaActualizacion:string;
}
