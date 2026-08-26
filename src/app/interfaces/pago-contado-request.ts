export interface PagoContadoRequest {

  formaDePago: string;

  medioPago: string;

  monto: number;

  proveedor: number;

  facturaCompra: number;

  descripcion?: string;

  numeroCheque?: string;

  banco?: string;

  titular?: string;

  quienEntrego?: string;

  nombreEntrega?: string;

  fechaEmision?: string;

  fechaCobro?: string;

  observacionCheque?: string;

}
