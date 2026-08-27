import { Injectable } from '@angular/core';
import { CtaCte } from '../interfaces/CtaCte';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments.prod';
import { registrarDeudaCtaCteCliente } from '../interfaces/registrarDeudaCtaCteCliente';
import { Observable } from 'rxjs';
import { TicketCtaCtePendienteCliente } from '../interfaces/TicketCtaCtePendienteCliente';
import {
  CobroCuentaCorrienteRequest,
  CobroCuentaCorrienteResponse,
} from '../interfaces/cobro-cuenta-corriente';
import { AlertaCuentaCorriente, HistorialCuentaCorriente, RecargoMoraResponse } from '../interfaces/historial-cuenta-corriente';
@Injectable({
  providedIn: 'root',
})
export class CtaCteService {
  constructor(private httpClient: HttpClient) { }
  baseUrl: string = environments.baseURL;
  save(ctaCte: CtaCte) {
    return this.httpClient.post<CtaCte>(`${this.baseUrl}CtaCte/save`, ctaCte);
  }
  updateCtaCte(id: number, registrarDeudaCtaCteCliente: registrarDeudaCtaCteCliente) {
console.log(registrarDeudaCtaCteCliente); 
    return this.httpClient.put<CtaCte>(`${this.baseUrl}CtaCte/update/${id}`, registrarDeudaCtaCteCliente);
  }
  obtenerFacturasPendientes(clienteId: number): Observable<TicketCtaCtePendienteCliente[]> {
    return this.httpClient.get<TicketCtaCtePendienteCliente[]>(
      `${this.baseUrl}ticket/cta-cte/${clienteId}`
    );
  }

  registrarCobro(clienteId: number, payload: CobroCuentaCorrienteRequest): Observable<CobroCuentaCorrienteResponse> {
    return this.httpClient.post<CobroCuentaCorrienteResponse>(
      `${this.baseUrl}CtaCte/clientes/${clienteId}/pagos`,
      payload
    );
  }

  obtenerHistorialCobros(clienteId: number): Observable<CobroCuentaCorrienteResponse[]> {
    return this.httpClient.get<CobroCuentaCorrienteResponse[]>(
      `${this.baseUrl}CtaCte/clientes/${clienteId}/pagos`
    );
  }

  obtenerHistorialCuenta(clienteId: number): Observable<HistorialCuentaCorriente> {
    return this.httpClient.get<HistorialCuentaCorriente>(`${this.baseUrl}CtaCte/clientes/${clienteId}/historial`);
  }

  descargarHistorialPdf(clienteId: number): Observable<Blob> {
    return this.httpClient.get(`${this.baseUrl}CtaCte/clientes/${clienteId}/historial/pdf`, { responseType: 'blob' });
  }

  obtenerAlertas(): Observable<AlertaCuentaCorriente[]> {
    return this.httpClient.get<AlertaCuentaCorriente[]>(`${this.baseUrl}CtaCte/alertas`);
  }

  descargarAlertasPdf(): Observable<Blob> {
    return this.httpClient.get(`${this.baseUrl}CtaCte/alertas/pdf`, { responseType: 'blob' });
  }

  aplicarMora(clienteId: number, facturaId: number, porcentaje: number): Observable<RecargoMoraResponse> {
    return this.httpClient.post<RecargoMoraResponse>(`${this.baseUrl}CtaCte/clientes/${clienteId}/facturas/${facturaId}/mora`, { porcentaje });
  }
}

