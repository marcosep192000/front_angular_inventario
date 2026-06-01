import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments.prod';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/Product';
import { Observable } from 'rxjs';
import { ProductItemSale } from '../interfaces/ProductItemSale';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
actualizarPreciosMasivo(payload: any): Observable<void> {
  return this.http.post<void>(
    `${this.base}supermarket/actualizar-precios-masivo`,
    payload
  );
}


  form: any;
  constructor(private http: HttpClient) {}
  base: String = environments.baseURL;
  getProducts(page: number, size: number,filter:string ='') {
  return this.http.get<any>(
    `${this.base}supermarket/products?page=${page}&size=${size}&filter=${filter}`
  );
}
  findById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}supermarket/find/${id}`);
  }

//buscar por proveedor 
getProductoPorCategoria (idProveedor:number):Observable<Product[]>{
  return this.http.get<Product[]>(`${this.base}supermarket/find-for-provider/${idProveedor}`);
}
getProductoPorProveedor (idProveedor:number):Observable<Product[]>{
  return this.http.get<Product[]>(`${this.base}supermarket/find-for-provider/${idProveedor}`);
}
 
  save(product: Product): Observable<Product> {
    return this.http.post<Product>(
      `${this.base}supermarket/create-supermarket`,
      product
    );
  }
  update(id: number, product: Product) {
    return this.http.put(`${this.base}supermarket/update-product/${id}`, product, {
      responseType: 'text' as 'json'
    });
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}supermarket/supermarket-delete/${id}`,
      {}
    );
  }
  search(query: string): Observable<ProductItemSale> {
    return this.http.get<ProductItemSale>(`${this.base}supermarket/findByCode/${query}`);
  }
  productosBajoStock():Observable<Product>{
    return this.http.get<Product>(`${this.base}supermarket/get-all-low-stock`);
  }
}
