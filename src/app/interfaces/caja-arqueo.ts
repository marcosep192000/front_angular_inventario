import { MovimientoLibroDiario } from "./movimiento-libro-diario";

export interface CajaArqueo {

  cajaId: number;

  fecha: Date;

  saldoApertura: number;

  totalIngresos: number;

  totalEgresos: number;

  saldoEsperado: number;

  movimientos: MovimientoLibroDiario[];

}
