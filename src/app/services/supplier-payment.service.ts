import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments.prod';
import { HttpClient } from '@angular/common/http';
import { BuySupplier } from '../interfaces/buy-supplier';
import { Observable } from 'rxjs';
import { facturasProveedor } from '../interfaces/facturasProveedor';
@Injectable({
  providedIn: 'root',
})
export class SupplierPaymentService {
  base: string = environments.baseURL;

  constructor(private http: HttpClient) {}

  createPaymentSupplier(buySupplier: BuySupplier): Observable<BuySupplier> {
    return this.http.post<BuySupplier>(
      `${this.base}invoice-provider/new-invoice-provider`,
      buySupplier
    );
  }
  getAllFacturasProveedor(id:number): Observable<facturasProveedor> {
 return this.http.get<facturasProveedor>(
   `${this.base}provider/invoice-provider-all/` + id  );
  }
}
