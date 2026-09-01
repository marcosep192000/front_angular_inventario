import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { CreatePurchaseOrderRequest, PageResponse, PurchaseOrder, PurchaseOrderActionRequest, PurchaseOrderFilters, PurchaseOrderSummary, PurchaseProductCandidate, PurchaseProductFilters, ReceivePurchaseOrderRequest, UpdatePurchaseOrderRequest } from '../interfaces/purchase-order';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly url = `${environments.baseURL}purchase-orders`;
  constructor(private readonly http: HttpClient) {}
  getLowStockProducts(filters: PurchaseProductFilters = {}): Observable<PageResponse<PurchaseProductCandidate>> { return this.http.get<PageResponse<PurchaseProductCandidate>>(`${this.url}/low-stock`, { params: this.params(filters) }); }
  getLowStockByProvider(providerId: number, filters: PurchaseProductFilters = {}): Observable<PageResponse<PurchaseProductCandidate>> { return this.http.get<PageResponse<PurchaseProductCandidate>>(`${this.url}/low-stock/provider/${providerId}`, { params: this.params(filters) }); }
  getProducts(filters: PurchaseProductFilters = {}): Observable<PageResponse<PurchaseProductCandidate>> { return this.http.get<PageResponse<PurchaseProductCandidate>>(`${this.url}/products`, { params: this.params(filters) }); }
  getPurchaseOrders(filters: PurchaseOrderFilters = {}): Observable<PageResponse<PurchaseOrderSummary>> { return this.http.get<PageResponse<PurchaseOrderSummary>>(this.url, { params: this.params(filters) }); }
  getPurchaseOrderById(id: number): Observable<PurchaseOrder> { return this.http.get<PurchaseOrder>(`${this.url}/${id}`); }
  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(this.url, request); }
  updatePurchaseOrder(id: number, request: UpdatePurchaseOrderRequest): Observable<PurchaseOrder> { return this.http.put<PurchaseOrder>(`${this.url}/${id}`, request); }
  sendPurchaseOrder(id: number, request: PurchaseOrderActionRequest = {}): Observable<PurchaseOrder> { return this.http.put<PurchaseOrder>(`${this.url}/${id}/send`, request); }
  receivePurchaseOrder(id: number, request: ReceivePurchaseOrderRequest): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.url}/${id}/receive`, request); }
  cancelPurchaseOrder(id: number, request: PurchaseOrderActionRequest = {}): Observable<PurchaseOrder> { return this.http.put<PurchaseOrder>(`${this.url}/${id}/cancel`, request); }
  private params(filters: object): HttpParams { let params = new HttpParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); }); return params; }
}
