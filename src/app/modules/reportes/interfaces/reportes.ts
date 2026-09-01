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

export interface PaginaReporte<T = ResumenReporte> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
