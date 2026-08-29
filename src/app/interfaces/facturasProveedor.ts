export interface FacturasProveedor {

  id: number;

  idInvoice: string;

  dueDate: string;

  payDay: string | null;

  providerName: string;

  payamentStatus: boolean;

  tipoDeCuentaEnum: string | null;

  amount: number;

  saldoPendiente: number;

  montoTotal: number;

  montoTotalDecimal?: number;

  subtotalNeto?: number;

  ivaTotal?: number;

  impuestosTotal?: number;

  totalCalculado?: number;

  redondeo?: number;

  observacionRedondeo?: string | null;

  pagoList: any[];

  dateOfEntry: string;

}
