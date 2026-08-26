export interface PagoFacturaProveedor {

  id: number | null;

  fecha: string | null;

  monto: number;

  tipoPago: string | null;

  medioPago: string | null;

  pagado: boolean;

  aplicado: boolean;

  estado: string | null;

  cheque: ChequePago | null;
}


export interface ChequePago {

  id: number | null;

  numeroCheque: string | null;

  banco: string | null;

  monto: number;

  titularCheque: string | null;

  quienEntrego: string | null;

  nombreEntrega: string | null;

  fechaEmision: string | null;

  fechaCobro: string | null;

  estado: string | null;
}
