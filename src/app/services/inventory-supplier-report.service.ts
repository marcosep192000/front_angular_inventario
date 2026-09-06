import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { CostAlert, CostHistoryItem, ProductComparisonSummary, ProductSupplierComparison, ProviderInvoiceReport, ProviderProductReport, ProviderPurchaseSummary, ReportPage, SavingsRequestItem, SavingsResponse } from '../interfaces/supplier-report';

@Injectable({ providedIn: 'root' })
export class InventorySupplierReportService {
  private readonly base = `${environments.baseURL}inventory/reports`;
  constructor(private http: HttpClient) {}
  getProductComparison(productId: number, includeInactive = false) { return this.http.get<ProductSupplierComparison>(`${this.base}/products/${productId}/supplier-comparison`, { params: { includeInactive } }); }
  compareProducts(productIds: number[]) { return this.http.post<ProductComparisonSummary[]>(`${this.base}/supplier-comparison`, { productIds }); }
  getCostHistory(productId: number, filters: { providerId?: number | null; from?: string; to?: string; page: number; size: number }) { return this.http.get<ReportPage<CostHistoryItem>>(`${this.base}/products/${productId}/cost-history`, { params: this.params(filters) }); }
  getProviderPurchaseSummary(filters: { providerId?: number | null; from?: string; to?: string }) { return this.http.get<ProviderPurchaseSummary[]>(`${this.base}/providers/purchases`, { params: this.params(filters) }); }
  getProviderPurchases(providerId: number, filters: { from?: string; to?: string; page: number; size: number }) { return this.http.get<ReportPage<ProviderInvoiceReport>>(`${this.base}/providers/${providerId}/purchases`, { params: this.params(filters) }); }
  getCostAlerts(page: number, size: number) { return this.http.get<ReportPage<CostAlert>>(`${this.base}/products/cost-alerts`, { params: { page, size } }); }
  calculatePotentialSavings(items: SavingsRequestItem[]) { return this.http.post<SavingsResponse>(`${this.base}/potential-savings`, { items }); }
  getProviderProducts(providerId: number, filters: { search?: string; preferredOnly: boolean; withPriceOnly: boolean; page: number; size: number }) { return this.http.get<ReportPage<ProviderProductReport>>(`${this.base}/providers/${providerId}/products`, { params: this.params(filters) }); }
  private params(values: Record<string, unknown>): HttpParams { let params = new HttpParams(); Object.entries(values).forEach(([key, value]) => { if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value)); }); return params; }
}
