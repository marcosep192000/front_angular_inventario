import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { ProductSupplier, ProductSupplierRequest } from '../interfaces/product-supplier';

@Injectable({ providedIn: 'root' })
export class ProductSupplierService {
  private readonly url = `${environments.baseURL}inventory`;
  constructor(private http: HttpClient) {}

  getByProduct(productId: number) {
    return this.http.get<ProductSupplier[]>(`${this.url}/products/${productId}/suppliers`);
  }
  create(productId: number, request: ProductSupplierRequest) {
    return this.http.post<ProductSupplier>(`${this.url}/products/${productId}/suppliers`, request);
  }
  update(id: number, request: ProductSupplierRequest) {
    return this.http.put<ProductSupplier>(`${this.url}/product-suppliers/${id}`, request);
  }
  setPreferred(id: number) {
    return this.http.patch<ProductSupplier>(`${this.url}/product-suppliers/${id}/preferred`, null);
  }
  deactivate(id: number) {
    return this.http.delete<void>(`${this.url}/product-suppliers/${id}`);
  }

  search(providerId: number, supplierProductCode: string) {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('supplierProductCode', supplierProductCode.trim());
    return this.http.get<ProductSupplier>(`${this.url}/product-suppliers/search`, { params });
  }
}
