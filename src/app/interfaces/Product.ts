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
  availableStock: number;
  minimumStock: number;
  variantStockManaged?: boolean;
  fractionable?: boolean;
  /** @deprecated Compatibility only. */
  stock: number;
  baseUnit?: UnitOfMeasure | null;
  iva: number;
  stateIva: boolean;
  tipoIva?: TipoIva;
  /** @deprecated Compatibility only. */
  stockMin: number;
  image: string;
  expiration: number;
  salePrice: Float32Array;
  productUsefulness: Float32Array;
  barCode: string | null;
  status: boolean ; 
  fechaUltimaActualizacion:string;
}
