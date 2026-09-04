import { DescuentoDetalleProveedor } from "./descuento-detalle-proveedor";

export interface Marca {
  id: number;
  marca: string;
}

export interface ProductItemBuy {
  id: number;
  productId?: number;
  barCode: string;
  name: string;
  description?: string;

  // Precio actual/costo mostrado en Angular
  price: number;



  stock: number;
  stockMin: number;
descuentos?: DescuentoDetalleProveedor[];

precioLista?: number;

precioNeto?: number;

subtotalNeto?: number;

importeIva?: number;
  // Porcentaje para mostrar/calcular visualmente
  iva: number;

  // Alícuota que recibe el backend al registrar una factura de proveedor.
  tipoIva?: string;

  marca?: Marca;

  quantity: number;

  presentationId?: number | null;
  variantId?: number | null;
  baseQuantity?: number;
  unitSymbol?: string;
  presentationName?: string;
  conversionFactor?: number;
  expectedPurchasePrice?: number | null;
  detectedDiscountPercent?: number | null;

  totalStock: number;

  // Solo visual. El backend vuelve a calcularlo.
  precioTotal: number;
}

 
