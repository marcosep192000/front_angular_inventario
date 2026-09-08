import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../../environments/environments';
import { FiltrosReporte, ResumenReporte, PaginaReporte, InventarioBajoStock, InventarioSinStock, InventarioStockValorizado, InventarioInmovilizado } from '../interfaces/reportes';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly baseUrl = `${environments.baseURL}reportes/`;

  constructor(private readonly http: HttpClient) {}

  consultar<T extends ResumenReporte | ResumenReporte[] = ResumenReporte | ResumenReporte[]>(ruta: string, filtros: FiltrosReporte = {}): Observable<T> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== null && valor !== undefined && valor !== '') params = params.set(clave, String(valor));
    });
    return this.http.get<T>(`${this.baseUrl}${ruta}`, { params });
  }

  getVentasResumen(f: FiltrosReporte) { return this.consultar('ventas/resumen', f); }
  getVentasProductos(f: FiltrosReporte) { return this.consultar('ventas/productos', f); }
  getRankingProductos(f: FiltrosReporte) { return this.consultar('ventas/ranking-productos', f); }
  getCuentaCorrienteClientes(f: FiltrosReporte = {}) { return this.consultar('clientes/cuenta-corriente', f); }
  getAntiguedadDeuda(f: FiltrosReporte = {}) { return this.consultar('clientes/antiguedad-deuda', f); }
  getStockValorizado(f: FiltrosReporte) { return this.consultar<InventarioStockValorizado>('inventario/stock-valorizado', f); }
  getBajoStock(f: FiltrosReporte) { return this.consultar<PaginaReporte<InventarioBajoStock>>('inventario/bajo-stock', f); }
  getSinStock(f: FiltrosReporte) { return this.consultar<PaginaReporte<InventarioSinStock>>('inventario/sin-stock', f); }
  getStockInmovilizado(f: FiltrosReporte) { return this.consultar<InventarioInmovilizado>('inventario/inmovilizado', f); }
  getComprasProveedor(f: FiltrosReporte) { return this.consultar('proveedores/compras', f); }
  getDeudaProveedores(f: FiltrosReporte) { return this.consultar('proveedores/deuda', f); }
  getEvolucionCostos(productoId: number) { return this.consultar(`proveedores/evolucion-costos/${productoId}`); }
  getResumenCaja(f: FiltrosReporte) { return this.consultar('caja/resumen', f); }
  getArqueosCaja(f: FiltrosReporte = {}) { return this.consultar('caja/arqueos', f); }
  getMediosPago(f: FiltrosReporte) { return this.consultar('caja/medios-pago', f); }
}
