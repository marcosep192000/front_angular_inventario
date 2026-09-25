import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { CloudCommercial, CloudStore, CommercialSettings, DeliveryZone, DeliveryZoneRequest, MercadoPagoStatus, OrderSchedule } from '../interfaces/cloud-store';

@Injectable({ providedIn: 'root' })
export class CloudStoreService {
  private readonly url = `${environments.baseURL}cloud/store`;
  constructor(private http: HttpClient) {}
  store() { return this.http.get<CloudStore>(this.url); }
  updateName(name: string) { return this.http.put<CloudStore>(`${this.url}/name`, { name }); }
  commercial() { return this.http.get<CloudCommercial>(`${this.url}/commercial`); }
  updateCommercial(body: CommercialSettings) { return this.http.put<CloudCommercial>(`${this.url}/commercial`, body); }
  uploadImage(kind: 'logo' | 'banner', file: File) { const body = new FormData(); body.append('file', file); return this.http.post<void>(`${this.url}/${kind}`, body); }
  deleteImage(kind: 'logo' | 'banner') { return this.http.delete<void>(`${this.url}/${kind}`); }
  schedule() { return this.http.get<OrderSchedule>(`${this.url}/order-schedule`); }
  updateSchedule(body: OrderSchedule) { return this.http.put<OrderSchedule>(`${this.url}/order-schedule`, body); }
  zones() { return this.http.get<DeliveryZone[]>(`${this.url}/delivery-zones`); }
  createZone(body: DeliveryZoneRequest) { return this.http.post<DeliveryZone>(`${this.url}/delivery-zones`, body); }
  updateZone(id: number, body: DeliveryZoneRequest) { return this.http.put<DeliveryZone>(`${this.url}/delivery-zones/${id}`, body); }
  deleteZone(id: number) { return this.http.delete<void>(`${this.url}/delivery-zones/${id}`); }
  mercadoPago() { return this.http.get<MercadoPagoStatus>(`${this.url}/mercado-pago`); }
  updateMercadoPago(body: { enabled: boolean; accessToken: string | null; webhookSecret: string | null }) { return this.http.put<MercadoPagoStatus>(`${this.url}/mercado-pago`, body); }
}
