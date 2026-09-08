export interface FiltrosReporte {
  desde?: string;
  hasta?: string;
  clienteId?: number;
  proveedorId?: number;
  productoId?: number;
  categoriaId?: number;
  marcaId?: number;
  medioPago?: string;
  tipoComprobante?: string;
  condicionVenta?: string;
  tipoCuenta?: string;
  estadoPago?: boolean;
  tipoRanking?: 'MAS_VENDIDOS' | 'MAYOR_FACTURACION' | 'MAYOR_GANANCIA' | 'MAYOR_MARGEN' | 'MENOS_VENDIDOS' | 'SIN_VENTAS';
  limit?: number;
  diasSinVenta?: number;
  cajaId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ResumenReporte {
  [campo: string]: unknown;
}

export interface PaginaReporte<T = ResumenReporte> extends ResumenReporte {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

/** Canonical inventory contract; nullable barcode is valid for imported products. */
export interface InventarioProducto extends ResumenReporte {
  productoId: number;
  codigo: string | null;
  nombre: string;
  availableStock: number;
  minimumStock: number;
  variantStockManaged: boolean;
}
export interface InventarioStockDetalle extends InventarioProducto {
  costoUnitario: number; precioVenta: number;
  valorStockCosto: number; valorStockVenta: number; gananciaPotencial: number;
}
export interface InventarioBajoStock extends InventarioProducto {
  diferencia: number; proveedor: string | null;
  ultimaCompra: string | null; ultimaVenta: string | null; nivel: 'CRITICO' | 'BAJO';
}
export interface InventarioSinStock extends InventarioProducto {
  ventasUltimos30Dias: number; ultimaVenta: string | null;
  ultimaCompra: string | null; proveedor: string | null;
}
export interface InventarioInmovilizadoDetalle extends InventarioProducto {
  costo: number; capitalInmovilizado: number; fechaUltimaVenta: string | null; diasSinVenta: number;
}

export interface InventarioStockValorizado extends ResumenReporte {
  resumen: { cantidadProductos: number; unidadesStock: number; valorCosto: number; valorVenta: number; gananciaPotencial: number };
  detalle: InventarioStockDetalle[];
}
export interface InventarioInmovilizado extends ResumenReporte {
  resumen: { productosInmovilizados: number; unidadesInmovilizadas: number; capitalInmovilizado: number };
  detalle: InventarioInmovilizadoDetalle[];
}
