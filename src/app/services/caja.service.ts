import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { Caja } from '../interfaces/Caja';
import { Observable } from 'rxjs';
import { cajaSaldoApertura } from '../interfaces/cajaSaldoApertura';
import { detalleCajaTipoContado } from '../interfaces/detalleCajaTipoContado';
import { CajaArqueo } from '../interfaces/caja-arqueo';
import { PuntoCaja } from '../interfaces/punto-caja';

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



  getPuntosActivos(): Observable<PuntoCaja[]> {
    return this.httpClient.get<PuntoCaja[]>(`${this.baseUrl}puntos-caja/activos`);
  }

  getCajas(puntoCajaId?: number | null): Observable<Caja> {
    const query = puntoCajaId ? `?puntoCajaId=${puntoCajaId}` : '';
    return this.httpClient.get<Caja>(`${this.baseUrl}cajas/abierta${query}`);
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

}

abrirPunto(puntoCajaId: number, saldoApertura: number) {
  return this.httpClient.post<Caja>(`${this.baseUrl}cajas/apertura`, { puntoCajaId, saldoApertura });
}

cerrarPunto(puntoCajaId: number, efectivoContado: number, efectivoParaProximaCaja: number) {
  return this.httpClient.put<Caja>(`${this.baseUrl}cajas/punto/${puntoCajaId}/cierre`, { efectivoContado, efectivoParaProximaCaja });
}

getCajaPendiente(puntoCajaId?: number | null): Observable<Caja | null> {

  const query = puntoCajaId ? `?puntoCajaId=${puntoCajaId}` : '';
  return this.httpClient.get<Caja | null>(
    `${this.baseUrl}cajas/pendiente${query}`
  );

}
}
