import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { SCANNER_TERMINAL_ID, ScannerSession } from './scanner.models';

@Injectable({ providedIn: 'root' })
export class ScannerService {
  private readonly url = `${environments.baseURL}scanner/session`;
  constructor(private readonly http: HttpClient) {}

  createSession(terminalId = SCANNER_TERMINAL_ID): Observable<ScannerSession> {
    const headers = terminalId ? new HttpHeaders({ 'X-Terminal-Id': terminalId }) : undefined;
    return this.http.post<ScannerSession>(this.url, {}, { headers });
  }

  closeSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(sessionId)}`);
  }
}
