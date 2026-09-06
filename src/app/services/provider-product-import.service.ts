import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import {
  ProviderProductImportAnalysis,
  ProviderProductImportConfirmRequest,
  ProviderProductImportDefaults,
  ProviderProductImportMapping,
  ProviderProductImportPreview,
  ProviderProductImportResult,
  ProviderProductImportRowsPage,
  ProviderProductImportStatus,
} from '../interfaces/provider-product-import';

@Injectable({ providedIn: 'root' })
export class ProviderProductImportService {
  private readonly base = `${environments.baseURL}inventory/provider-products/import/excel`;
  constructor(private http: HttpClient) {}

  preview(file: File, headerRow = 0, sheet?: string) {
    const body = new FormData();
    body.append('file', file);
    let params = new HttpParams().set('headerRow', headerRow);
    if (sheet) params = params.set('sheet', sheet);
    return this.http.post<ProviderProductImportPreview>(`${this.base}/preview`, body, { params });
  }

  analyze(file: File, providerId: number, mapping: ProviderProductImportMapping, defaults: ProviderProductImportDefaults) {
    return this.http.post<ProviderProductImportAnalysis>(`${this.base}/analyze`, this.multipart(file, { providerId, mapping, defaults }));
  }

  getAnalysisRows(analysisId: string, page: number, size: number, status?: ProviderProductImportStatus, search?: string) {
    let params = new HttpParams().set('page', page).set('size', Math.min(200, Math.max(1, size)));
    if (status) params = params.set('status', status);
    const term = search?.trim();
    if (term) params = params.set('search', term);
    return this.http.get<ProviderProductImportRowsPage>(`${this.base}/analyses/${analysisId}/rows`, { params });
  }

  confirmAnalysis(request: ProviderProductImportConfirmRequest) {
    const payload: ProviderProductImportConfirmRequest = {
      ...request,
      overrides: request.overrides.map(({ rowNumber, action, productId }) => ({ rowNumber, action, ...(productId == null ? {} : { productId }) })),
    };
    return this.http.post<ProviderProductImportResult>(`${this.base}/confirm`, payload);
  }

  deleteAnalysis(analysisId: string) {
    return this.http.delete<void>(`${this.base}/analyses/${analysisId}`);
  }

  private multipart(file: File, request: unknown) {
    const body = new FormData();
    body.append('file', file);
    body.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    return body;
  }
}
