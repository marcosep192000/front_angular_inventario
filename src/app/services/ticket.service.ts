import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SaleCommon } from '../interfaces/sale-common';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
 private  baseUrl = environments.baseURL;

 constructor(private http: HttpClient){

    }

  getByNumero(numero: string): Observable<SaleCommon> {
    return this.http.get<any>(
      `${this.baseUrl}ticket/numero/${encodeURIComponent(numero)}`
    ).pipe(
      map(response => this.normalizarTicket(response)),
    );
  }

  obtenerTipoDocumentoSugerido(clienteId: number): Observable<'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C'> {
    return this.http.get<'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C'>(`${this.baseUrl}ticket/tipo-documento-sugerido/${clienteId}`);
  }

  private normalizarTicket(response: any): SaleCommon {
    const ticket = response?.ticket ?? response?.data ?? response;
    const candidatos = [
      ticket?.ticketDetails,
      ticket?.details,
      ticket?.detalles,
      ticket?.detalleTickets,
      ticket?.ticketDetail,
      ticket?.items,
      response?.ticketDetails,
      response?.details,
    ];

    const detalles = candidatos.find(Array.isArray) ??
      candidatos.find(candidato => Array.isArray(candidato?.content))?.content ??
      candidatos.find(candidato => Array.isArray(candidato?.items))?.items ??
      [];

    return {
      ...ticket,
      cliente: ticket?.cliente ?? response?.cliente,
      ticketDetails: detalles.map((detalle: any) => ({
        ...detalle,
        productName: detalle.productName ?? detalle.nombreProducto ?? detalle.product?.name ?? detalle.producto?.name ?? detalle.producto?.nombre ?? 'Producto sin nombre',
        amount: Number(detalle.amount ?? detalle.quantity ?? detalle.cantidad ?? 0),
        salePrice: Number(detalle.salePrice ?? detalle.price ?? detalle.precio ?? detalle.precioUnitario ?? 0),
        subTotal: Number(detalle.subTotal ?? detalle.subtotal ?? detalle.importe ?? detalle.total ?? 0),
      })),
      pagos: ticket?.pagos ?? response?.pagos ?? [],
    } as SaleCommon;
  }
  
}
