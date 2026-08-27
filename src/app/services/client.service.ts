import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments.prod';
import { Observable } from 'rxjs';
import { Client } from '../interfaces/Client';
import { CtaCte } from '../interfaces/CtaCte';

export interface LimiteCuentaCorrienteResponse {
  cuentaCorrienteId: number;
  clienteId: number;
  limite: number;
  deudaActual: number;
  saldoDisponible: number;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  baseUrl: string = environments.baseURL;

  constructor(private http: HttpClient) {}

  // Get all clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}customer`);
  }

  // Add new client
  addClient(client: any) {
    return this.http.post(`${this.baseUrl}customer/create`, client);
  }
  // Get client by ID
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}customer/find/${id}`);
  }

  getClientByDni(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}customer/get-by-name/${id}`);
  }

  // Update client by ID
  updateClient(id: number, client: Client) {
    console.log(id + ' updated');
    return this.http.put<Client>(
      `${this.baseUrl}customer/update/${id}`,
      client
    );
  }
  // Delete client by ID
  delete(id: number) {
    return this.http.delete(`${this.baseUrl}customer/delete-supplier/${id}`);
  }

  guardarCuentaCorriente(idClient: number, cuenta: Pick<CtaCte, 'montoMaximoDeCtaCte'>) {
    return this.http.post(
      `${this.baseUrl}customer/${idClient}/cuenta-corriente`,
      cuenta
    );
  }

  actualizarLimiteCuentaCorriente(clienteId: number, nuevoLimite: number): Observable<LimiteCuentaCorrienteResponse> {
    return this.http.put<LimiteCuentaCorrienteResponse>(
      `${this.baseUrl}customer/${clienteId}/cuenta-corriente/limite`,
      { nuevoLimite }
    );
  }
}
