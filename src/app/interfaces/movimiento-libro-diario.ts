export interface MovimientoLibroDiario {

  id: number;

  fechaHora: Date;

  tipo: string;

  categoriaMovimiento: string;

  numeroComprobante: string;

  medioPago: string;

  descripcion: string;

  ingreso: number;

  egreso: number;

  saldo: number;

}
