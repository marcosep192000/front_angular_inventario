export interface MovimientoDetalle {

  id: number;

  numeroComprobante: string;

  fechaHora: string;

  tipo: string;

  categoriaMovimiento: string;

  monto: number;

  medioPago: string;

  observacion: string;

  referenciaPago: string;

  descripcion?: string;

  proveedorId?: number;

  proveedorNombre?: string;

  numeroFactura?: string;

  empleadoId?: number;

  empleadoNombre?: string;

  tipoSueldo?: string;

  fechaPago?: string;

  mesCorrespondiente?: number;

  anioCorrespondiente?: number;

  estado?: string;


  // =========================================================
  // DATOS DEL CHEQUE
  // =========================================================

  numeroCheque?: string;

  bancoCheque?: string;

  titularCheque?: string;

  fechaEmisionCheque?: string;

  fechaCobroCheque?: string;

  estadoCheque?: string;

}
