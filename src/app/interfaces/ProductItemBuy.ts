import { DescuentoDetalleProveedor } from "./descuento-detalle-proveedor";

export interface Marca {
  id: number;
  marca: string;
}

export interface ProductItemBuy {
  id: number;
  productId?: number;
  productSupplierId?: number | null;
  supplierProductCode?: string | null;
  supplierBarcode?: string | null;
  linkExistingProduct?: boolean;
  supplierLinked?: boolean;
  barCode: string;
  name: string;
  description?: string;

  // Precio actual/costo mostrado en Angular
  price: number;



  availableStock: number;
  minimumStock: number;
  variantStockManaged?: boolean;
  fractionable?: boolean;
  /** @deprecated Compatibility only. */
  stock: number;
  /** @deprecated Compatibility only. */
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

 
