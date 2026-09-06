import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { ReportPage } from '../interfaces/supplier-report';
import {
  CreateSupplierPriceListRequest,
  SupplierPriceListDetail,
  SupplierPriceListExcelImportResult,
  SupplierPriceListExcelMapping,
  SupplierPriceListExcelPreview,
  SupplierPriceListExcelValidation,
  SupplierPriceListItem,
  SupplierPriceListItemRequest,
  SupplierPriceListStatus,
  SupplierPriceListSummary,
  SupplierPriceMarketComparison,
} from '../interfaces/supplier-price-list';
@Injectable({ providedIn: 'root' })
export class SupplierPriceListService {
  private readonly base = `${environments.baseURL}inventory/provider-price-lists`;
  constructor(private http: HttpClient) {}
  createPriceList(body: CreateSupplierPriceListRequest) {
    return this.http.post<SupplierPriceListDetail>(this.base, body);
  }
  getPriceLists(f: {
    providerId?: number | null;
    status?: SupplierPriceListStatus | null;
    from?: string;
    to?: string;
    search?: string;
    page: number;
    size: number;
  }) {
    return this.http.get<ReportPage<SupplierPriceListSummary>>(this.base, {
      params: this.params(f),
    });
  }
  getPriceList(id: number) {
    return this.http.get<SupplierPriceListDetail>(`${this.base}/${id}`);
  }
  addItem(id: number, body: SupplierPriceListItemRequest) {
    return this.http.post<SupplierPriceListItem>(
      `${this.base}/${id}/items`,
      body,
    );
  }
  addItemsBatch(id: number, items: SupplierPriceListItemRequest[]) {
    return this.http.post<SupplierPriceListItem[]>(
      `${this.base}/${id}/items/batch`,
      { items },
    );
  }
  previewExcel(file: File, headerRow = 0, sheet?: string) {
    const body = new FormData();
    body.append('file', file);
    let params = new HttpParams().set('headerRow', headerRow);
    if (sheet) params = params.set('sheet', sheet);
    return this.http.post<SupplierPriceListExcelPreview>(
      `${this.base}/import/excel/preview`,
      body,
      { params },
    );
  }
  validateExcel(
    id: number,
    file: File,
    mapping: SupplierPriceListExcelMapping,
  ) {
    return this.http.post<SupplierPriceListExcelValidation>(
      `${this.base}/import/excel/validate`,
      this.excelBody(file, mapping),
      { params: { priceListId: id } },
    );
  }
  importExcel(id: number, file: File, mapping: SupplierPriceListExcelMapping) {
    return this.http.post<SupplierPriceListExcelImportResult>(
      `${this.base}/${id}/import/excel`,
      this.excelBody(file, mapping),
    );
  }
  getItems(
    id: number,
    f: {
      matched?: boolean | null;
      search?: string;
      increaseOnly?: boolean;
      decreaseOnly?: boolean;
      betterThanCurrentBest?: boolean;
      page: number;
      size: number;
    },
  ) {
    return this.http.get<ReportPage<SupplierPriceListItem>>(
      `${this.base}/${id}/items`,
      { params: this.params(f) },
    );
  }
  linkProduct(itemId: number, productId: number) {
    return this.http.patch<SupplierPriceListItem>(
      `${this.base}/items/${itemId}/link-product`,
      { productId },
    );
  }
  unlink(itemId: number) {
    return this.http.patch<SupplierPriceListItem>(
      `${this.base}/items/${itemId}/unlink`,
      null,
    );
  }
  review(id: number) {
    return this.http.patch<SupplierPriceListDetail>(
      `${this.base}/${id}/review`,
      null,
    );
  }
  archive(id: number) {
    return this.http.patch<SupplierPriceListDetail>(
      `${this.base}/${id}/archive`,
      null,
    );
  }
  getComparison(id: number, page: number, size: number) {
    return this.http.get<ReportPage<SupplierPriceListItem>>(
      `${this.base}/${id}/comparison`,
      { params: { page, size } },
    );
  }
  getMarketComparison(id: number, page: number, size: number) {
    return this.http.get<ReportPage<SupplierPriceMarketComparison>>(
      `${this.base}/${id}/market-comparison`,
      { params: { page, size } },
    );
  }
  private excelBody(file: File, mapping: SupplierPriceListExcelMapping) {
    const body = new FormData();
    body.append('file', file);
    body.append(
      'mapping',
      new Blob([JSON.stringify(mapping)], { type: 'application/json' }),
    );
    return body;
  }
  private params(v: Record<string, unknown>) {
    let p = new HttpParams();
    Object.entries(v).forEach(([k, x]) => {
      if (x !== null && x !== undefined && x !== '') p = p.set(k, String(x));
    });
    return p;
  }
}
