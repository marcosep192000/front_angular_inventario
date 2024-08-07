import { Category } from "./Category";

export interface Product {
  id: number;
  category: Category;
  name: string;
  description: string;
  price: Float32Array;
  stock: number;
  stockMin: number;
  image: string;
  expiration: number;
  unitOfMeasure: null;
  salePrice: Float32Array;
  productUsefulness: Float32Array;
  barCode: number;
}
