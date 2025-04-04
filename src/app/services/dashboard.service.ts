import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { environments } from '../../environments/environments';
import { ReturnStatement } from '@angular/compiler';
import { error } from 'console';
import { dataDashboard } from '../interfaces/dashboard';
import { VentasPorDia } from '../interfaces/VentasPorDia';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environments.baseURL;
  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<dataDashboard> {
    return this.http.get<dataDashboard>(`${this.apiUrl}dashboard/data`);
  }
  getVentasPorDia(): Observable<VentasPorDia[]> {
  return this.http.get<VentasPorDia[]>(`${this.apiUrl}dashboard/ventas-por-dia`);  }

}
