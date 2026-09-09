export interface Caja {

  id: number;

  fecha: string;

  saldoApertura: number;

  totalIngresos: number;

  totalEgresos: number;

  saldoCierre: number;

  estado: boolean;

  // =====================================================
  // DATOS DEL CIERRE / ARQUEO
  // =====================================================

  efectivoContado?: number;

  diferenciaArqueo?: number;

  montoRetiro?: number;

  efectivoProximaCaja?: number;

  retiroEfectivo?: boolean;

  puntoCaja?: import('./punto-caja').PuntoCaja | null;
  puntoCajaNombre?: string;
  usuarioAperturaNombre?: string;
  usuarioCierreNombre?: string;
  fechaApertura?: string | null;
  fechaCierre?: string | null;

}
