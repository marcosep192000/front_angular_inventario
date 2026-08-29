import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { Url } from 'url';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../interfaces/Movimiento';
import { MovimientoDetalle } from '../interfaces/movimiento-detalle';

@Injectable({
  providedIn: 'root'
})
export class MovimientoCajaService {
  saveMovimiento(endpoint: string, movimiento: any) {
    throw new Error('Method not implemented.');
  }
base : string = environments.baseURL;
  constructor(private http :HttpClient ) { }
   getAll(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.base}cajas/movimiento`);
  }

  create(mov: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.base}cajas/movimiento/crear`, mov);
  }
  getDetalle(id:number){

    return this.http.get<MovimientoDetalle>(`${this.base}cajas/movimiento/detalle/${id}`);

}
}
