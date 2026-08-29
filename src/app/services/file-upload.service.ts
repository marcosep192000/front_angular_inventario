import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  baseUrl: string = environments.baseURL; 
  constructor( private http: HttpClient) { }
  uploadFile(file: File, providerId: number): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
  
    return this.http.post(`${this.baseUrl}supermarket/upload/${providerId}`, formData, {
      reportProgress: true,
      observe: 'events' // 🔹 Ahora sí es válido
    });
  }
  

  private getEventMessage(event: HttpEvent<any>): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return { progress: Math.round((100 * event.loaded) / (event.total ?? 1)) };
  
      case HttpEventType.Response:
        return { progress: 100, body: event.body }; // Devuelve el cuerpo de la respuesta correctamente
  
      default:
        return { progress: 0 };
    }
  }

  private handleError(error: HttpErrorResponse): Observable<number> {
    console.error('Error al subir el archivo:', error);
    return of(0); // Retorna 0% de progreso en caso de error
  }



}
