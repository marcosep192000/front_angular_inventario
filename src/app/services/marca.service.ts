import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { Marca } from '../interfaces/marca';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  constructor(private HttpClient: HttpClient) { }
   
  base: string = environments.baseURL; 

  allMarca(): Observable<Marca[]> {
    return this.HttpClient.get<Marca[]>(`${this.base}marca`);
  }
  saveMarca(marca: Marca): Observable<Marca>{
    return this.HttpClient.post<Marca>(`${this.base}marca/create`, marca);
    
  }
  

}
