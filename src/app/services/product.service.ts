import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments.prod';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/Product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  form: any;

  constructor(private http: HttpClient) {}

  base: String = environments.baseURL;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}supermarket`);
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
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }
}
