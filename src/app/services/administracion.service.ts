import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { CompanyResponse, Empresa, EmpresaRequest, UsuarioEmpresa, UsuarioEmpresaRequest } from '../interfaces/administracion';
@Injectable({ providedIn: 'root' })
export class AdministracionService {
  private readonly url = `${environments.baseURL}company`;
  constructor(private readonly http: HttpClient) {}
  obtenerEmpresa(): Observable<Empresa> { return this.http.get<Empresa>(`${this.url}/configuracion`); }
  guardarEmpresa(request: EmpresaRequest): Observable<Empresa> { return this.http.put<Empresa>(`${this.url}/configuracion`, request); }
  listarUsuarios(): Observable<UsuarioEmpresa[]> { return this.http.get<UsuarioEmpresa[]>(`${this.url}/usuarios`); }
  crearUsuario(request: UsuarioEmpresaRequest): Observable<UsuarioEmpresa> { return this.http.post<UsuarioEmpresa>(`${this.url}/usuarios`, request); }
  actualizarUsuario(id: number, request: UsuarioEmpresaRequest): Observable<UsuarioEmpresa> { return this.http.put<UsuarioEmpresa>(`${this.url}/usuarios/${id}`, request); }
  eliminarUsuario(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/usuarios/${id}`); }
  cargarLogo(file: File): Observable<CompanyResponse> { const data = new FormData(); data.append('file', file); return this.http.post<CompanyResponse>(`${this.url}/configuracion/logo`, data); }
  obtenerLogo(): Observable<Blob> { return this.http.get(`${this.url}/configuracion/logo?t=${Date.now()}`, { responseType: 'blob' }); }
  eliminarLogo(): Observable<void> { return this.http.delete<void>(`${this.url}/configuracion/logo`); }
  cargarFotoUsuario(id: number, file: File): Observable<UsuarioEmpresa> { const data = new FormData(); data.append('file', file); return this.http.post<UsuarioEmpresa>(`${this.url}/usuarios/${id}/foto`, data); }
  obtenerFotoUsuario(id: number): Observable<Blob> { return this.http.get(`${this.url}/usuarios/${id}/foto?t=${Date.now()}`, { responseType: 'blob' }); }
  eliminarFotoUsuario(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/usuarios/${id}/foto`); }
}
