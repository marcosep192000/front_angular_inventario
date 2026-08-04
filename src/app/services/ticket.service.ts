import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleCommon } from '../interfaces/sale-common';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
 private  baseUrl = environments.baseURL;

 constructor(private http: HttpClient){

    }

      getByNumero(numero: string): Observable<SaleCommon> {
    return this.http.get<SaleCommon>(
      `${this.baseUrl}ticket/numero/${numero}`
    );
  }
  
}
