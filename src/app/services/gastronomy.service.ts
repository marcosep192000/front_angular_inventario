import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { GastronomyGroup, GastronomyGroupPayload, GastronomyOption, GastronomyOptionPayload } from '../interfaces/gastronomy';

@Injectable({ providedIn: 'root' })
export class GastronomyService {
  private readonly base = environments.baseURL;
  constructor(private http: HttpClient) {}

  groups(productId: number): Observable<GastronomyGroup[]> { return this.http.get<GastronomyGroup[]>(`${this.base}products/${productId}/gastronomy/groups`); }
  createGroup(productId: number, body: GastronomyGroupPayload): Observable<GastronomyGroup> { return this.http.post<GastronomyGroup>(`${this.base}products/${productId}/gastronomy/groups`, body); }
  updateGroup(productId: number, groupId: number, body: GastronomyGroupPayload): Observable<GastronomyGroup> { return this.http.put<GastronomyGroup>(`${this.base}products/${productId}/gastronomy/groups/${groupId}`, body); }
  deleteGroup(productId: number, groupId: number): Observable<void> { return this.http.delete<void>(`${this.base}products/${productId}/gastronomy/groups/${groupId}`); }
  createOption(productId: number, groupId: number, body: GastronomyOptionPayload): Observable<GastronomyOption> { return this.http.post<GastronomyOption>(`${this.base}products/${productId}/gastronomy/groups/${groupId}/options`, body); }
  updateOption(productId: number, groupId: number, optionId: number, body: GastronomyOptionPayload): Observable<GastronomyOption> { return this.http.put<GastronomyOption>(`${this.base}products/${productId}/gastronomy/groups/${groupId}/options/${optionId}`, body); }
  deleteOption(productId: number, groupId: number, optionId: number): Observable<void> { return this.http.delete<void>(`${this.base}products/${productId}/gastronomy/groups/${groupId}/options/${optionId}`); }
}
