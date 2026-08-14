import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments.prod';
import { Caja } from '../interfaces/Caja';
import { Observable } from 'rxjs';
import { cajaSaldoApertura } from '../interfaces/cajaSaldoApertura';
import { detalleCajaTipoContado } from '../interfaces/detalleCajaTipoContado';
import { CajaArqueo } from '../interfaces/caja-arqueo';

@Injectable({
  providedIn: 'root',
})
export class CajaService {
  baseUrl = environments.baseURL;
  constructor(private httpClient: HttpClient) { }

  // Get all cajas
  getAllCajas(): Observable<Caja[]>{
   return this.httpClient.get<Caja[]>(`${this.baseUrl}cajas/todas`);
}



  getCajas(): Observable<Caja> {
    return this.httpClient.get<Caja>(`${this.baseUrl}cajas/abierta`);
  }
closeCaja(
  cajaId: number,
  efectivoContado: number,
  efectivoParaProximaCaja: number
) {

  return this.httpClient.put(
    `${this.baseUrl}cajas/${cajaId}/cierre`,
    {
      efectivoContado,
      efectivoParaProximaCaja
    }
  );
}
getDetalleCajaContado():Observable<detalleCajaTipoContado[]>{
  return this.httpClient.get<detalleCajaTipoContado[]>(`${this.baseUrl}cajas/contado`) ;
}

getArqueo(id: number) {

  return this.httpClient.get<CajaArqueo>(
      `${this.baseUrl}cajas/${id}/arqueo`
  );

}
descargarPdf(id: number) {

  return this.httpClient.get(

    `${this.baseUrl}cajas/${id}/arqueo/pdf`,

    {
      responseType: 'blob'
    }

  );

}

abrirCaja(cajaId: number) {

  return this.httpClient.put<Caja>(
    `${this.baseUrl}cajas/${cajaId}/apertura`,
    {}
  );

}getCajaPendiente(): Observable<Caja | null> {

  return this.httpClient.get<Caja | null>(
    `${this.baseUrl}cajas/pendiente`
  );

}
}
