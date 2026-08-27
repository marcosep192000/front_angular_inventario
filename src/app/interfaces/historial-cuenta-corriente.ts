export type TipoMovimientoCuenta = 'FACTURA' | 'PAGO' | 'MORA';
export type NivelRiesgo = 'AL_DIA' | 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export interface MovimientoCuentaCorriente { fecha: string; tipo: TipoMovimientoCuenta; comprobante: string; detalle: string; debe: number; haber: number; saldoAcumulado: number; }
export interface HistorialCuentaCorriente { clienteId: number; cliente: string; cuit: string; limite: number; deudaActual: number; saldoDisponible: number; movimientos: MovimientoCuentaCorriente[]; }
export interface AlertaCuentaCorriente { clienteId: number; cliente: string; facturaId: number; comprobante: string; fechaEmision: string; fechaVencimiento: string; diasParaVencer: number; diasVencida: number; vencida: boolean; saldoPendiente: number; riesgo: NivelRiesgo; aviso: string; }
export interface RecargoMoraResponse { recargoId: number; facturaId: number; comprobante: string; porcentaje: number; montoBase: number; montoMora: number; nuevoSaldoPendiente: number; fechaHora: string; }
