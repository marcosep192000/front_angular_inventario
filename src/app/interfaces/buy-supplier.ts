import { ImpuestoFacturaProveedor } from "./impuesto-factura-proveedor";
import { ProductItemBuy } from "./ProductItemBuy";

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

  dateOfEntry: string;

  dueDate: string | null;

  payDay: string | null;

  tipoDeCuentaEnum: string;

  provider: number;

  payamentStatus: boolean;

  invoiceDetailsProviders: ProductItemBuy[];

  subtotalNeto?: number;

  ivaTotal?: number;

  totalCalculado?: number;

  redondeo?: number;

  montoTotal?: number;

  impuestos: ImpuestoFacturaProveedor[];
}
