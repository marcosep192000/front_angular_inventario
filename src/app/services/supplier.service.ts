import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
 
import { environments } from '../../environments/environments.prod';
import { catchError, Observable, pipe, throwError } from 'rxjs';
import { Supplier } from '../interfaces/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliers: any[] = [];
  selectedSupplier: any;
  loading: boolean = false;
  base: String = environments.baseURL;

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.base}provider`);
  }

  findById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.base}provider/find/${id}`);
  }

  update(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(
      `${this.base}provider/update/${id}`,
      supplier
    );
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http
      .post<Supplier>(`${this.base}provider/create-provider`, supplier)
      .pipe(catchError(this.manejarError));
  }
  manejarError(error: HttpErrorResponse) {
    if (error.status === 500) {
      // Código de conflicto
      return throwError(() => new Error('El CUIT ya existe.'));
    }
    return throwError(() => new Error('Error inesperado.'));
  }

  deleteSupplier(id: number): Observable<Supplier> {
    return this.http.delete<Supplier>(`${this.base}provider/deleted/${id}`);
  }

  getPayMethod(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.base}supplier-pay-conditions/type-account`
    );
  }
}
