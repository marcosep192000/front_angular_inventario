
export interface invoiceDetailsProviders {
  barCode: string;
  productName: string;
  description: string;
  price: number;
  amount: number;
  idProduct: number;
  salePrice: number;
  marca: String;
  iva: number;
  
  totalStock: number;
  subTotal: number;
}
export interface BuySupplier {
  idInvoice: string;
  dateOfEntry: string; //fecha ingreso
  dueDate: string; // fecha vencimiento
  payDay: string; // dia de pago
  provider: number; // proveedor
  amount: number; // monto total  de factura
  invoiceDetailsProviders: any[];
}