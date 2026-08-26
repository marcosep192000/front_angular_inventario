export interface ChequeProveedor {
  id: number;
  facturaId: number;
  proveedor: {
    id: number;
    name: string;
    cuit: string;
  };
  banco: string;
  monto: number;
  numeroCheque: string;
  titularCheque: string;
  quienEntrego: string;
  nombreEntrega: string;
  fechaEmision: string;
  fechaCobro: string;
  estado: string;
}
