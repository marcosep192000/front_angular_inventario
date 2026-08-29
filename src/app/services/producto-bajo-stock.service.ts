import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LowStockByProvider } from '../interfaces/producto-bajo-stock';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ProductoBajoStockService {
    base: String = environments.baseURL;

  constructor(private http: HttpClient) {}

  getLowStockProducts(): Observable<LowStockByProvider[]> {
    return this.http.get<LowStockByProvider[]>(`${this.base}supermarket/getAllLowStock`);
  }
}
