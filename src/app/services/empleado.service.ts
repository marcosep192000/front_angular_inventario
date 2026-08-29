import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empleado, EstadoCuentaEmpleado, LiquidacionSueldo, PagoEmpleado } from '../interfaces/empleado';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = 'http://localhost:8080/api/v1/empleados';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Empleado[]> { return this.http.get<Empleado[]>(this.apiUrl); }
  crear(data: Partial<Empleado>): Observable<Empleado> { return this.http.post<Empleado>(this.apiUrl, data); }
  actualizar(id:number,data:Partial<Empleado>): Observable<Empleado> { return this.http.put<Empleado>(`${this.apiUrl}/${id}`,data); }
  desactivar(id:number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  estadoCuenta(id:number): Observable<EstadoCuentaEmpleado> { return this.http.get<EstadoCuentaEmpleado>(`${this.apiUrl}/${id}/estado-cuenta-cliente`); }
  adelanto(id:number,data:any): Observable<any> { return this.http.post(`${this.apiUrl}/${id}/adelantos`,data); }
  crearLiquidacion(id:number,data:any): Observable<LiquidacionSueldo> { return this.http.post<LiquidacionSueldo>(`${this.apiUrl}/${id}/liquidaciones`,data); }
  liquidaciones(id:number): Observable<LiquidacionSueldo[]> { return this.http.get<LiquidacionSueldo[]>(`${this.apiUrl}/${id}/liquidaciones`); }
  movimientos(id:number): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/${id}/movimientos`); }
  pagarLiquidacion(id:number,pagos:PagoEmpleado[]): Observable<LiquidacionSueldo> { return this.http.post<LiquidacionSueldo>(`${this.apiUrl}/liquidaciones/${id}/pagar`,{pagos}); }
  reportePdf(desde:string,hasta:string): Observable<Blob> { return this.http.get(`${this.apiUrl}/reportes/pdf`,{params:{desde,hasta},responseType:'blob'}); }
}
