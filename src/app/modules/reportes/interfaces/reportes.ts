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
  tipoRanking?: 'MAS_VENDIDOS' | 'MAYOR_FACTURACION' | 'MAYOR_GANANCIA';
  limit?: number;
  dias?: number;
}

export interface ResumenReporte {
  [campo: string]: string | number | null | undefined;
}
