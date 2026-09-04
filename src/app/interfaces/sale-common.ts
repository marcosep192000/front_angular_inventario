import { Client } from './Client';

export interface TicketDetail {
  id?: number;

  amount: number;
  quantity?: number;
  baseQuantity?: number;
  presentationId?: number | null;
  inputUnitId?: number | null;
  variantId?: number | null;
  unitSnapshot?: string | null;
  presentationSnapshot?: string | null;
  variantSnapshot?: string | null;
  unitPriceAmount?: number | null;

  price: number;

  idProduct: number;

  productName: string;

  barCode: string;

  description?: string | null;

  salePrice: number;

  marca: string;

  iva: number;

  subTotal: number;

  unitProfit?: number | null;

  totalProfit?: number | null;
}

export interface Marca {
  id: number;
  marca: string;
}

import { PagoTicketRequest, PagoTicketResponse } from './pago-ticket';
import { FiscalAuthorizationStatus, ModoFacturacion } from './arca';

export interface SaleCommon {
  modoFacturacion?: ModoFacturacion;
  fiscalStatus?: FiscalAuthorizationStatus;
  originalTicketId?: number | null;
  fiscalDocument?: import('./arca').ArcaFiscalDocumentResponse | null;

  // =========================================================
  // IDENTIFICACIÓN
  // =========================================================

  id?: number;

  tipoDocumento:
    | 'FACTURA_A'
    | 'FACTURA_B'
    | 'FACTURA_C'
    | 'PRESUPUESTO'
    | 'REMITO'
    | 'NOTA_CREDITO_A'
    | 'NOTA_CREDITO_B'
    | 'NOTA_CREDITO_C'
    | 'NOTA_DEBITO_A'
    | 'NOTA_DEBITO_B'
    | 'NOTA_DEBITO_C'
    | string;

  numero?: string;
  number?: string;
  numeroComprobante?: string;
  state?: string;

  // =========================================================
  // CLIENTE
  // =========================================================

  client: number;
  cliente?: Client;

  ctaCte: number | null;

  // =========================================================
  // CONDICIÓN DE VENTA
  // =========================================================

  condicionVenta: 'CONTADO' | 'CTA_CTE' | string;

  // =========================================================
  // MEDIO DE PAGO
  // =========================================================

  medioPago?: string | null;

  pagos?: PagoTicketRequest[];

  // =========================================================
  // OBSERVACIÓN
  // =========================================================

  observation: string;

  // =========================================================
  // IMPORTES
  // =========================================================

  subTotal: number;

  total: number;
  netoGravado?: number;
  ivaTotal?: number;
  importeExento?: number;
  importeNoGravado?: number;
  desgloseIva?: unknown[];

  // =========================================================
  // DETALLES
  // =========================================================

  ticketDetails: TicketDetail[];

  // =========================================================
  // CAMPOS OPCIONALES DE RESPUESTA
  // =========================================================

  estado?: string;

  fechaEmision?: string | Date;

  ticketVto?: string | Date;

  totalCost?: number;

  totalProfit?: number;

  saldoPendiente?: number;

  pagosRegistrados?: PagoTicketResponse[];
}
