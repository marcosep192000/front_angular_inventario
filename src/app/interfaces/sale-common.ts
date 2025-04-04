export interface TicketDetail {
  amount: number;
  price: number;
  idProduct: number;
  productName: string;
  barCode: string;
  salePrice: number;
  marca: String;
  iva: number;
  subTotal: number;
}

export interface Marca {
  id: number;
  marca: string;
}
export interface SaleCommon {
  tipo: string; // Tipo de ticket (FACTURA, etc.)
  client: number; // ID del cliente (número)
  numero: number; // Número de ticket (número)
  observation: string; // Observaciones
  subTotal: number; // Subtotal del ticket
  total: number | null; // Total del ticket, puede ser nulo
  ticketDetails: TicketDetail[]; // Lista de detalles del ticket (productos)
}
