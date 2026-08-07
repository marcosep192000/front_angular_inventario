import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { environments } from '../../environments/environments';
import { ReturnStatement } from '@angular/compiler';
import { error } from 'console';
import { dashboardInfoGeneral, dataDashboard } from '../interfaces/dashboard';
import { VentasPorDia } from '../interfaces/VentasPorDia';
import { UltimaVenta } from '../interfaces/UltimaVenta';
import { LowStockByProvider } from '../interfaces/producto-bajo-stock';

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


getUltimasVentas(): Observable<UltimaVenta[]>{

   return this.http.get<UltimaVenta[]>(
      `${this.apiUrl}dashboard/ultimas-ventas`
   );

}
getProductosBajoStock(): Observable<LowStockByProvider[]> {

  return this.http.get<LowStockByProvider[]>(`${this.apiUrl}supermarket/get-all-low-stock`);


}
getDashboardInfoGeneral(): Observable<dashboardInfoGeneral> {
  return this.http.get<dashboardInfoGeneral>(
    `${this.apiUrl}dashboard/resumen`
  );
}
}
