export interface MovimientoCuentaCorriente {
  fecha: string | null;
  tipo: string;
  numeroFactura: string | null;
  monto: number;
  medioPago: string | null;
  tipoPago: string | null;
  estado: string;
  saldo: number;
}

export interface FacturaCuentaCorriente {
  facturaId: number;
  numeroFactura: string;
  fecha: string;
  vencimiento: string;
  total: number;
  totalPagado: number;
  saldo: number;
  estado: string;
}

export interface CuentaCorrienteProveedor {
  proveedorId: number;
  proveedorNombre: string;
  totalFacturado: number;
  totalPagado: number;
  saldoPendiente: number;
  facturas: FacturaCuentaCorriente[];
  movimientos: MovimientoCuentaCorriente[];
}
