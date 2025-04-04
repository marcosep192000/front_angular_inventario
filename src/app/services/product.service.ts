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
  form: any;

  constructor(private http: HttpClient) {}

  base: String = environments.baseURL;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}supermarket/products`);
  }
  findById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}supermarket/find/${id}`);
  }

  save(product: Product): Observable<Product> {
    return this.http.post<Product>(
      `${this.base}supermarket/create-supermarket`,
      product
    );
  }
  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(
      `${this.base}supermarket/update/${id}`,
      product
    );
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
}
