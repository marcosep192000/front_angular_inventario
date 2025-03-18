import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments.prod';
import { HttpClient } from '@angular/common/http';
import { BuySupplier } from '../interfaces/buy-supplier';
import { Observable } from 'rxjs';
import { facturasProveedor } from '../interfaces/facturasProveedor';
import { VerDetalleFacturaComponent } from '../pages/crud-supplier/pay-supplier/pay-supplier/ver-detalle-factura/ver-detalle-factura.component';
import { ProductItemBuy } from '../interfaces/ProductItemBuy';
@Injectable({
  providedIn: 'root',
})
export class SupplierPaymentService {
  base: string = environments.baseURL;

  constructor(private http: HttpClient) { }

  createPaymentSupplier(buySupplier: BuySupplier): Observable<BuySupplier> {
    return this.http.post<BuySupplier>(
      `${this.base}invoice-provider/new-invoice-provider`,
      buySupplier
    );
  }
  getAllFacturasProveedor(id:number): Observable<facturasProveedor> {
    return this.http.get<facturasProveedor>(
      `${this.base}provider/invoice-provider-all/` + id);
  }
  // buscar factura por proveedor 
  getFacturaDetalle(id: number): Observable<ProductItemBuy[]> {
    return this.http.get<ProductItemBuy[]>(`${this.base}invoice-provider/details/` + id);
  }
}
