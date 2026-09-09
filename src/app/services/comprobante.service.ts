import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { FormatoImpresion } from './print-preferences.service';
@Injectable({ providedIn: 'root' })
export class ComprobanteService {
  constructor(private readonly http: HttpClient) {}
  venta(id: number, formato: FormatoImpresion, inline = false): Observable<Blob> { const params = new HttpParams().set('formato', formato).set('disposition', inline ? 'inline' : 'attachment'); return this.http.get(`${environments.baseURL}ticket/${id}/pdf`, { params, responseType: 'blob' }); }
  caja(id: number): Observable<Blob> { return this.http.get(`${environments.baseURL}cajas/${id}/arqueo/pdf`, { responseType: 'blob' }); }
}
