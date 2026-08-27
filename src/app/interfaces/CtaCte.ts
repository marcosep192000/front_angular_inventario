

export interface CtaCte {
  id?: number;
  client?: number;
  /** Crédito disponible actualmente para seguir comprando. */
  saldo: number;
  montoMaximoDeCtaCte: number;
  estado?: boolean;
  fechaUltimaActualizacion?: string | Date;
}
