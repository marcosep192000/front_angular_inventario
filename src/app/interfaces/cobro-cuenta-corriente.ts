export type MedioPagoCobro =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'DEBITO'
  | 'CREDITO'
  | 'MERCADO_PAGO'
  | 'CHEQUE'
  | 'OTRO';

export interface PagoCuentaCorrienteRequest {
  medioPago: MedioPagoCobro;
  monto: number;
  referencia?: string | null;
}

export interface AplicacionCobroRequest {
  ticketId: number;
  monto: number;
}

export interface CobroCuentaCorrienteRequest {
  pagos: PagoCuentaCorrienteRequest[];
  aplicaciones: AplicacionCobroRequest[];
  observacion?: string | null;
}

export interface CobroCuentaCorrienteResponse {
  id: number;
  numeroComprobante: string;
  clienteId: number;
  fechaHora: string;
  total: number;
  saldoDisponibleCuenta: number;
  observacion?: string | null;
  pagos: Array<PagoCuentaCorrienteRequest & { id: number }>;
  aplicaciones: Array<{
    ticketId: number;
    numeroFactura: string;
    montoAplicado: number;
    saldoAnterior: number;
    saldoPosterior: number;
  }>;
}
