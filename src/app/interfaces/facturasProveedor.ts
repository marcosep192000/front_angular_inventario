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

  pagoList: any[];

  dateOfEntry: string;

}
