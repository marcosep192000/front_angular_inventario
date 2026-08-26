export interface ImpuestoFacturaProveedor {

  tipo: string;

  descripcion: string | null;

  porcentaje: number;

  baseImponible?: number;

  importe?: number;

}
