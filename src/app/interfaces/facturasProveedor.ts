export interface facturasProveedor {
  id: number;
  idInvoice: string;
  dueDate: string;
  payDay?: any;
  providerName: string;
  payamentStatus: boolean;
tipoDeCuentaEnum: String;
  amount: number;
  saldoPendiente: number;
  montoTotal: number;
  pagoList: any[];
  dateOfEntry: string;
}