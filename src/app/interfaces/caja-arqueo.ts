import { MedioPagoArqueo } from "./medio-pago-arqueo";
import { MovimientoLibroDiario } from "./movimiento-libro-diario";


 

export interface CajaArqueo {

  cajaId: number;

  fecha: string;

  saldoApertura: number;

  totalIngresos: number;

  totalEgresos: number;

  saldoEsperado: number;

  // ==============================
  // EFECTIVO
  // ==============================

  ingresosEfectivo: number;

  egresosEfectivo: number;

  efectivoEsperado: number;

  // ==============================
  // MEDIOS DE PAGO
  // ==============================

  transferencias: MedioPagoArqueo;

  mercadoPago: MedioPagoArqueo;

  debito: MedioPagoArqueo;

  credito: MedioPagoArqueo;

  cheques: MedioPagoArqueo;

  cuentaCorriente: MedioPagoArqueo;

  pagoCtaCte: MedioPagoArqueo;

  otros: MedioPagoArqueo;

  // ==============================
  // CIERRE
  // ==============================

  efectivoContado: number;

  diferenciaArqueo: number;

  montoRetiro: number;

  efectivoProximaCaja: number;

  retiroEfectivo: boolean;

  movimientos: MovimientoLibroDiario[];

}
