import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { environments } from '../../environments/environments';
import { LicenseActivationRequest, LicenseInstallation, LicenseLimits, LicenseStatus } from '../interfaces/license';
@Injectable({providedIn:'root'})
export class LicenseService {
  private readonly url = `${environments.baseURL}license`;
  private request?: Observable<LicenseStatus>;
  private readonly state = new BehaviorSubject<LicenseStatus|null>(null);
  readonly status$ = this.state.asObservable();
  constructor(private readonly http: HttpClient) {}
  get snapshot(): LicenseStatus|null { return this.state.value; }
  obtenerEstado(force=false): Observable<LicenseStatus> { if (!force && this.state.value) return of(this.state.value); if (!force && this.request) return this.request; this.request=this.http.get<LicenseStatus>(`${this.url}/status`).pipe(tap(v=>this.state.next(v)),shareReplay(1),finalize(()=>this.request=undefined)); return this.request; }
  obtenerInstallationId(): Observable<string> { return this.http.get<LicenseInstallation|string>(`${this.url}/installation-id`).pipe(tap(v=>{ if(typeof v==='object'&&v.installationId&&this.state.value)this.state.next({...this.state.value,installationId:v.installationId}); }), (source)=>new Observable<string>(s=>source.subscribe({next:v=>{s.next(typeof v==='string'?v:v.installationId);s.complete();},error:e=>s.error(e)}))); }
  activar(license:string): Observable<LicenseStatus> { const body:LicenseActivationRequest={license}; return this.http.post<LicenseStatus>(`${this.url}/activate`,body).pipe(tap(v=>this.state.next(v))); }
  obtenerLimites(): Observable<LicenseLimits> { return this.http.get<LicenseLimits>(`${this.url}/limits`); }
  limpiarCache(): void { this.state.next(null); this.request=undefined; }
}
