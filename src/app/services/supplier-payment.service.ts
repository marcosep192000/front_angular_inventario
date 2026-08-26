import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environments } from '../../environments/environments.prod';

import { BuySupplier } from '../interfaces/buy-supplier';
import { FacturasProveedor } from '../interfaces/facturasProveedor';
import { ProductItemBuy } from '../interfaces/ProductItemBuy';
import { CuentaCorrienteProveedor } from '../interfaces/cuenta-corriente-proveedor';
import { ChequeProveedor } from '../interfaces/cheque-proveedor';
import { PagoContadoRequest } from '../interfaces/pago-contado-request';
import { PagoFacturaProveedor } from '../interfaces/pago-factura-proveedor';

@Injectable({
  providedIn: 'root',
})
export class SupplierPaymentService {
  private readonly base = environments.baseURL;

  constructor(private http: HttpClient) {}

  // =========================================================
  // FACTURA PROVEEDOR
  // =========================================================

  createPaymentSupplier(buySupplier: BuySupplier): Observable<BuySupplier> {
    return this.http.post<BuySupplier>(
      `${this.base}invoice-provider/new-invoice-provider`,
      buySupplier,
    );
  }

  // =========================================================
  // FACTURAS DEL PROVEEDOR
  // =========================================================

  getAllFacturasProveedor(id: number): Observable<FacturasProveedor[]> {
    return this.http.get<FacturasProveedor[]>(
      `${this.base}provider/invoice-provider-all/${id}`,
    );
  }

  // =========================================================
  // DETALLE DE FACTURA
  // =========================================================

  getFacturaDetalle(id: number): Observable<ProductItemBuy[]> {
    return this.http.get<ProductItemBuy[]>(
      `${this.base}invoice-provider/details/${id}`,
    );
  }

  // =========================================================
  // CUENTA CORRIENTE
  // =========================================================

  getCuentaCorrienteProveedor(
    idProveedor: number,
  ): Observable<CuentaCorrienteProveedor> {
    return this.http.get<CuentaCorrienteProveedor>(
      `${this.base}provider/${idProveedor}/cuenta-corriente`,
    );
  }

  // =========================================================
  // CUENTA CORRIENTE POR FECHA
  // =========================================================

  getCuentaCorrienteProveedorPorFecha(
    idProveedor: number,
    desde: string,
    hasta: string,
  ): Observable<CuentaCorrienteProveedor> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);

    return this.http.get<CuentaCorrienteProveedor>(
      `${this.base}provider/${idProveedor}/cuenta-corriente`,
      { params },
    );
  }

  // =========================================================
  // CHEQUES PENDIENTES
  // =========================================================

  getChequesPendientesProveedor(
    proveedorId: number,
  ): Observable<ChequeProveedor[]> {
    return this.http.get<ChequeProveedor[]>(
      `${this.base}cheques/proveedor/${proveedorId}/pendientes`,
    );
  }

  // =========================================================
  // COBRAR CHEQUE
  // =========================================================

  cobrarCheque(
    facturaId: number,
    idCheque: number,
  ): Observable<ChequeProveedor> {
    return this.http.post<ChequeProveedor>(
      `${this.base}invoice-provider/${facturaId}/cheques/${idCheque}/cobrar`,
      {},
    );
  }

  getChequesCobradosProveedor(
    proveedorId: number,
  ): Observable<ChequeProveedor[]> {
    return this.http.get<ChequeProveedor[]>(
      `${this.base}cheques/proveedor/${proveedorId}/cobrados`,
    );
  }

  getChequesRechazadosProveedor(
    proveedorId: number,
  ): Observable<ChequeProveedor[]> {
    return this.http.get<ChequeProveedor[]>(
      `${this.base}cheques/proveedor/${proveedorId}/rechazados`,
    );
  }

  // =========================================================
  // RECHAZAR CHEQUE
  // =========================================================

  rechazarCheque(
    facturaId: number,
    idCheque: number,
  ): Observable<ChequeProveedor> {
    return this.http.post<ChequeProveedor>(
      `${this.base}invoice-provider/${facturaId}/cheques/${idCheque}/rechazar`,
      {},
    );
  }

  // =========================================================
  // REGISTRAR PAGO A PROVEEDOR
  // =========================================================

  registrarPagoProveedor(request: PagoContadoRequest): Observable<any> {
    return this.http.post<any>(`${this.base}invoice-provider/pagos`, request);
  }




  getPagosFacturaProveedor(
  facturaId: number
): Observable<PagoFacturaProveedor[]> {

  return this.http.get<PagoFacturaProveedor[]>(
    `${this.base}provider/invoice-provider/${facturaId}/pagos`
  );
}
}
