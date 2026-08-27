export type MedioPago =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'DEBITO'
  | 'CREDITO'
  | 'MERCADO_PAGO'
  | 'CHEQUE'
  | 'CUENTA_CORRIENTE'
  | 'OTRO';

export interface PagoTicketRequest {
  medioPago: MedioPago;
  monto: number;
  referencia?: string | null;
}

export interface PagoTicketResponse extends PagoTicketRequest {
  id: number;
}
