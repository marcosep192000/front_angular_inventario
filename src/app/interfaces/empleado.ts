export type FrecuenciaPagoEmpleado = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';
export type EstadoLiquidacionSueldo = 'PENDIENTE' | 'PAGADA' | 'ANULADA';
export interface EstadoCuentaEmpleado { clienteId: number | null; tieneCuentaCorriente: boolean; tieneDeuda: boolean; deudaPendiente: number; saldoDisponible: number; aviso: string; }
export interface Empleado { id:number; nombre:string; apellido:string; dni:string; sueldo:number; puesto?:string; fechaIngreso?:string; activo:boolean; frecuenciaPago:FrecuenciaPagoEmpleado; clienteId?:number|null; clienteNombre?:string|null; cuentaCliente?:EstadoCuentaEmpleado; }
export interface PagoEmpleado { medioPago:string; monto:number; referencia?:string|null; movimientoId?:number; numeroComprobante?:string; }
export interface LiquidacionSueldo { id:number; empleadoId:number; empleado:string; periodoDesde:string; periodoHasta:string; frecuenciaPago:FrecuenciaPagoEmpleado; sueldoBruto:number; totalAdelantos:number; netoAPagar:number; totalPagado:number; estado:EstadoLiquidacionSueldo; fechaPago?:string|null; observacion?:string|null; cuentaCliente?:EstadoCuentaEmpleado; adelantos:PagoEmpleado[]; pagos:PagoEmpleado[]; }
