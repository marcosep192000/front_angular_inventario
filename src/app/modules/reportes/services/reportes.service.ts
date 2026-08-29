import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../../environments/environments';
import { FiltrosReporte, ResumenReporte } from '../interfaces/reportes';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly baseUrl = `${environments.baseURL}reportes/`;

  constructor(private readonly http: HttpClient) {}

  consultar(ruta: string, filtros: FiltrosReporte = {}): Observable<ResumenReporte | ResumenReporte[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== null && valor !== undefined && valor !== '') params = params.set(clave, String(valor));
    });
    return this.http.get<ResumenReporte | ResumenReporte[]>(`${this.baseUrl}${ruta}`, { params });
  }

  getVentasResumen(f: FiltrosReporte) { return this.consultar('ventas/resumen', f); }
  getVentasProductos(f: FiltrosReporte) { return this.consultar('ventas/productos', f); }
  getRankingProductos(f: FiltrosReporte) { return this.consultar('ventas/ranking-productos', f); }
  getStockValorizado(f: FiltrosReporte) { return this.consultar('inventario/stock-valorizado', f); }
  getBajoStock(f: FiltrosReporte) { return this.consultar('inventario/bajo-stock', f); }
  getStockInmovilizado(f: FiltrosReporte) { return this.consultar('inventario/inmovilizado', f); }
  getComprasProveedor(f: FiltrosReporte) { return this.consultar('proveedores/compras', f); }
  getDeudaProveedores(f: FiltrosReporte) { return this.consultar('proveedores/deuda', f); }
  getResumenCaja(f: FiltrosReporte) { return this.consultar('caja/resumen', f); }
  getCuentaCorrienteClientes(f: FiltrosReporte) { return this.consultar('clientes/cuenta-corriente', f); }
}
