import { Injectable } from '@angular/core';
import { CtaCte } from '../interfaces/CtaCte';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments.prod';
import { registrarDeudaCtaCteCliente } from '../interfaces/registrarDeudaCtaCteCliente';
import { Console } from 'console';

@Injectable({
  providedIn: 'root',
})
export class CtaCteService {
  constructor(private httpClient: HttpClient) {}
  baseUrl: string = environments.baseURL;
  save(ctaCte: CtaCte) {
    return this.httpClient.post<CtaCte>(`${this.baseUrl}CtaCte/save`, ctaCte);
  }
  updateCtaCte(id: number, registrarDeudaCtaCteCliente: registrarDeudaCtaCteCliente) {
    
    return this.httpClient.put<CtaCte>(`${this.baseUrl}CtaCte/update/${id}`, registrarDeudaCtaCteCliente);
  }
 
}
   

