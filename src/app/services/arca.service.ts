import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import {
  ArcaAuthenticationTestResponse,
  ArcaConfigurationRequest,
  ArcaConfigurationResponse,
  ArcaFiscalDocumentResponse,
  ArcaFiscalPreview,
  ArcaStatusResponse,
  WsfeStatusResponse,
} from '../interfaces/arca';
@Injectable({ providedIn: 'root' })
export class ArcaService {
  private readonly url = `${environments.baseURL}arca`;
  constructor(private http: HttpClient) {}
  getConfiguration(): Observable<ArcaConfigurationResponse> {
    return this.http.get<ArcaConfigurationResponse>(`${this.url}/config`);
  }
  createConfiguration(
    body: ArcaConfigurationRequest,
  ): Observable<ArcaConfigurationResponse> {
    return this.http.post<ArcaConfigurationResponse>(
      `${this.url}/config`,
      body,
    );
  }
  updateConfiguration(
    body: ArcaConfigurationRequest,
  ): Observable<ArcaConfigurationResponse> {
    return this.http.put<ArcaConfigurationResponse>(`${this.url}/config`, body);
  }
  getStatus(): Observable<ArcaStatusResponse> {
    return this.http.get<ArcaStatusResponse>(`${this.url}/status`);
  }
  testAuthentication(): Observable<ArcaAuthenticationTestResponse> {
    return this.http.post<ArcaAuthenticationTestResponse>(
      `${this.url}/test-authentication`,
      {},
    );
  }
  getWsfeStatus(): Observable<WsfeStatusResponse> {
    return this.http.get<WsfeStatusResponse>(`${this.url}/wsfe/status`);
  }
  preview(ticketId: number): Observable<ArcaFiscalPreview> {
    return this.http.get<ArcaFiscalPreview>(
      `${this.url}/comprobantes/${ticketId}/preview`,
    );
  }
  authorize(ticketId: number): Observable<ArcaFiscalDocumentResponse> {
    return this.http.post<ArcaFiscalDocumentResponse>(
      `${this.url}/comprobantes/${ticketId}/autorizar`,
      {},
    );
  }
  getDocument(ticketId: number): Observable<ArcaFiscalDocumentResponse> {
    return this.http.get<ArcaFiscalDocumentResponse>(
      `${this.url}/comprobantes/${ticketId}`,
    );
  }
  reconcile(ticketId: number): Observable<ArcaFiscalDocumentResponse> {
    return this.http.post<ArcaFiscalDocumentResponse>(
      `${this.url}/comprobantes/${ticketId}/reconciliar`,
      {},
    );
  }
  retry(ticketId: number): Observable<ArcaFiscalDocumentResponse> {
    return this.http.post<ArcaFiscalDocumentResponse>(
      `${this.url}/comprobantes/${ticketId}/reintentar`,
      {},
    );
  }
  getQr(ticketId: number): Observable<Blob> {
    return this.http.get(`${this.url}/comprobantes/${ticketId}/qr`, {
      responseType: 'blob',
    });
  }
  getTicketPdf(ticketId: number): Observable<Blob> {
    return this.http.get(`${environments.baseURL}ticket/${ticketId}/pdf`, {
      responseType: 'blob',
    });
  }
}
