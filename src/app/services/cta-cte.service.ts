import { Injectable } from '@angular/core';
import { CtaCte } from '../interfaces/CtaCte';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments.prod';
import { registrarDeudaCtaCteCliente } from '../interfaces/registrarDeudaCtaCteCliente';
import { Observable } from 'rxjs';
import { TicketCtaCtePendienteCliente } from '../interfaces/TicketCtaCtePendienteCliente';
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
  buscarticketsCtaCtePendienteCliente(id:number):Observable<TicketCtaCtePendienteCliente[]>{
return this.httpClient.get<TicketCtaCtePendienteCliente[]>(`${this.baseUrl}ticket/cta-cte/${id}`);
}
registrarPago(id: number, payload: registrarDeudaCtaCteCliente) {
  return this.httpClient.put(`${this.baseUrl}CtaCte/pagar/${id}`, payload);
 }
pagarMontoParcial(clienteId: number, monto: number) {
  return this.httpClient.post<any>(
    `${this.baseUrl}ticket/cuenta-corriente/pagar-monto?clienteId=${clienteId}&monto=${monto}`,
    null // sin body
  );
}
}

