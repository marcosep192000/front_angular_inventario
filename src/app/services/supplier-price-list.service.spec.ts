import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { SupplierPriceListService } from './supplier-price-list.service';
describe('SupplierPriceListService', () => {
  let service: SupplierPriceListService;
  let http: HttpTestingController;
  const base = `${environments.baseURL}inventory/provider-price-lists`;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SupplierPriceListService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('lists with backend filters and pagination', () => {
    service
      .getPriceLists({
        providerId: 3,
        status: 'DRAFT',
        from: '2026-01-01',
        to: '2026-02-01',
        search: 'enero',
        page: 2,
        size: 20,
      })
      .subscribe();
    const r = http.expectOne((x) => x.url === base);
    expect(r.request.params.get('providerId')).toBe('3');
    expect(r.request.params.get('status')).toBe('DRAFT');
    expect(r.request.params.get('page')).toBe('2');
    expect(r.request.params.get('search')).toBe('enero');
    r.flush({ contenido: [] });
  });
  it('creates a draft contract with exact dates', () => {
    const body = {
      providerId: 4,
      name: 'Lista enero',
      referenceDate: '2026-01-10',
      validFrom: '2026-01-10',
      validUntil: '2026-02-10',
      sourceFileName: null,
      notes: null,
    };
    service.createPriceList(body).subscribe();
    const r = http.expectOne(base);
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(body);
    r.flush({});
  });
  it('adds an item preserving code and four decimals', () => {
    service
      .addItem(7, {
        supplierProductCode: '00125',
        supplierBarcode: null,
        description: 'Electrodo',
        offeredPrice: 8150.5,
      })
      .subscribe();
    const r = http.expectOne(`${base}/7/items`);
    expect(r.request.body.supplierProductCode).toBe('00125');
    expect(r.request.body.offeredPrice).toBe(8150.5);
    r.flush({});
  });
  it('uses real item filters and pagination', () => {
    service
      .getItems(7, {
        matched: false,
        search: 'x',
        betterThanCurrentBest: true,
        page: 1,
        size: 50,
      })
      .subscribe();
    const r = http.expectOne((x) => x.url === `${base}/7/items`);
    expect(r.request.params.get('matched')).toBe('false');
    expect(r.request.params.get('betterThanCurrentBest')).toBe('true');
    expect(r.request.params.get('page')).toBe('1');
    r.flush({ contenido: [] });
  });
  it('links and unlinks using exact endpoints', () => {
    service.linkProduct(9, 42).subscribe();
    let r = http.expectOne(`${base}/items/9/link-product`);
    expect(r.request.body).toEqual({ productId: 42 });
    r.flush({});
    service.unlink(9).subscribe();
    r = http.expectOne(`${base}/items/9/unlink`);
    expect(r.request.method).toBe('PATCH');
    r.flush({});
  });
  it('reviews and archives without payload data', () => {
    service.review(7).subscribe();
    let r = http.expectOne(`${base}/7/review`);
    expect(r.request.method).toBe('PATCH');
    r.flush({});
    service.archive(7).subscribe();
    r = http.expectOne(`${base}/7/archive`);
    expect(r.request.method).toBe('PATCH');
    r.flush({});
  });
  it('uses paginated previous-list and market comparisons', () => {
    service.getComparison(7, 2, 20).subscribe();
    let r = http.expectOne(
      (x) => x.url === `${base}/7/comparison` && x.params.get('page') === '2',
    );
    r.flush({ contenido: [] });
    service.getMarketComparison(7, 3, 50).subscribe();
    r = http.expectOne(
      (x) =>
        x.url === `${base}/7/market-comparison` &&
        x.params.get('size') === '50',
    );
    r.flush({ contenido: [] });
  });
  it('previews Excel with zero-based header row and selected sheet', () => {
    service.previewExcel(new File(['x'], 'lista.xlsx'), 2, 'Mayorista').subscribe();
    const r = http.expectOne(x => x.url === `${base}/import/excel/preview`);
    expect(r.request.method).toBe('POST');
    expect(r.request.params.get('headerRow')).toBe('2');
    expect(r.request.params.get('sheet')).toBe('Mayorista');
    expect(r.request.body instanceof FormData).toBeTrue();
    r.flush({});
  });
  it('validates and imports using the exact multipart endpoints', () => {
    const file = new File(['x'], 'lista.xlsx');
    const mapping = {sheet:'Hoja 1',headerRow:0,supplierProductCodeColumn:'SKU',supplierBarcodeColumn:null,descriptionColumn:'Producto',offeredPriceColumn:'Precio'};
    service.validateExcel(12,file,mapping).subscribe();
    let r=http.expectOne(x=>x.url===`${base}/import/excel/validate`&&x.params.get('priceListId')==='12');
    expect(r.request.body instanceof FormData).toBeTrue();r.flush({});
    service.importExcel(12,file,mapping).subscribe();
    r=http.expectOne(`${base}/12/import/excel`);expect(r.request.method).toBe('POST');expect(r.request.body instanceof FormData).toBeTrue();r.flush({});
  });
});
