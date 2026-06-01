export interface Movimiento {
  id?: number;
  tipo_movimiento: string;  // <- clave para el backend (Spring lo usa para saber la subclase)
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  descripcion?: string;
  numeroComprobante?: string;
  tipoDeContado?: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADO_PAGO';
  categoriaMovimiento?: string;
  cajaId?: number;
}
export interface MovimientoGastoMenor extends Movimiento {
  categoriaGasto: string;
}

export interface MovimientoProveedor extends Movimiento {
  proveedorId: number;
  numeroFactura: string;
}

export interface MovimientoSueldo extends Movimiento {
id?: number;
  empleadoId: number;
  monto: number;
  tipoSueldo: 'ADELANTO' | 'SUELDO_MENSUAL';
  mesCorrespondiente: number;
  anioCorrespondiente: number;
  fechaPago?: string;
}