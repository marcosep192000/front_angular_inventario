import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { ProviderProductImportService } from './provider-product-import.service';

describe('ProviderProductImportService analysis sessions', () => {
  let service: ProviderProductImportService;
  let http: HttpTestingController;
  const base = `${environments.baseURL}inventory/provider-products/import/excel`;
  const file = new File(['x'], 'maestro.xlsx');
  const mapping: any = { sheet: 'Sheet1', headerRow: 0, supplierProductCodeColumn: 'CODIGO', supplierBarcodeColumn: null, productBarcodeColumn: null, nameColumn: 'descripcion', ivaColumn: 'iva', purchasePriceColumn: 'PRECIO', profitPercentageColumn: 'utilidad-ganancia' };
  const defaults: any = { categoryId: null, brandId: null, baseUnitId: null, fractionable: false };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ProviderProductImportService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends analyze as multipart and receives analysisId', () => {
    let id = '';
    service.analyze(file, 7, mapping, defaults).subscribe(x => (id = x.analysisId));
    const request = http.expectOne(`${base}/analyze`);
    expect(request.request.body instanceof FormData).toBeTrue();
    request.flush({ analysisId: 'analysis-1' });
    expect(id).toBe('analysis-1');
  });

  it('loads a bounded server page with status and an unmodified zero-prefixed search', () => {
    service.getAnalysisRows('analysis-1', 3, 200, 'NEW_PRODUCT', '  00125  ').subscribe();
    const request = http.expectOne(x => x.url === `${base}/analyses/analysis-1/rows`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('3');
    expect(request.request.params.get('size')).toBe('200');
    expect(request.request.params.get('status')).toBe('NEW_PRODUCT');
    expect(request.request.params.get('search')).toBe('00125');
    request.flush({ content: [], page: 3, size: 200, totalElements: 0, totalPages: 0 });
  });

  it('caps page size at 200', () => {
    service.getAnalysisRows('analysis-1', 0, 500).subscribe();
    const request = http.expectOne(x => x.url.includes('/analyses/analysis-1/rows'));
    expect(request.request.params.get('size')).toBe('200');
    request.flush({ content: [], page: 0, size: 200, totalElements: 0, totalPages: 0 });
  });

  it('confirms with JSON analysisId and only serializable local overrides', () => {
    service.confirmAnalysis({ analysisId: 'analysis-1', providerId: 7, defaultAction: 'CREATE_NEW', overrides: [{ rowNumber: 245, action: 'LINK_EXISTING', productId: 42, productName: 'Sólo UI' }, { rowNumber: 302, action: 'SKIP' }] }).subscribe();
    const request = http.expectOne(`${base}/confirm`);
    expect(request.request.body).toEqual({ analysisId: 'analysis-1', providerId: 7, defaultAction: 'CREATE_NEW', overrides: [{ rowNumber: 245, action: 'LINK_EXISTING', productId: 42 }, { rowNumber: 302, action: 'SKIP' }] });
    expect(request.request.body instanceof FormData).toBeFalse();
    request.flush({});
  });

  it('deletes an active analysis', () => {
    service.deleteAnalysis('analysis-1').subscribe();
    const request = http.expectOne(`${base}/analyses/analysis-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
