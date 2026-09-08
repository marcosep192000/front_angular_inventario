import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environments } from '../../environments/environments';
import { dashboardInfoGeneral, dataDashboard } from '../interfaces/dashboard';
import { VentasPorDia } from '../interfaces/VentasPorDia';
import { UltimaVenta } from '../interfaces/UltimaVenta';
import { LowStockProduct, LowStockPage } from '../interfaces/producto-bajo-stock';

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
getProductosBajoStock(): Observable<LowStockProduct[]> {

  return this.http.get<LowStockPage>(`${this.apiUrl}supermarket/low-stock`, { params: { page: 0, size: 10 } }).pipe(map(page => page.content));
}
getDashboardInfoGeneral(): Observable<dashboardInfoGeneral> {
  return this.http.get<dashboardInfoGeneral>(
    `${this.apiUrl}dashboard/resumen`
  );
}
}
