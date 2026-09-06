import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { ProductSupplierRequest } from '../interfaces/product-supplier';
import { ProductSupplierService } from './product-supplier.service';

describe('ProductSupplierService', () => {
  let service: ProductSupplierService;
  let http: HttpTestingController;
  const baseUrl = `${environments.baseURL}inventory`;
  const payload: ProductSupplierRequest = {
    providerId: 8,
    supplierProductCode: 'PROV-100',
    supplierBarcode: '7790000123456',
    purchasePrice: 7950.1234,
    lastPurchasePrice: 8100.5678,
    preferred: true,
    active: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ProductSupplierService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists every supplier associated with a product', () => {
    service.getByProduct(21).subscribe();
    const request = http.expectOne(`${baseUrl}/products/21/suppliers`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a relation without losing decimal price precision', () => {
    service.create(21, payload).subscribe();
    const request = http.expectOne(`${baseUrl}/products/21/suppliers`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body.purchasePrice).toBe(7950.1234);
    request.flush({});
  });

  it('updates the supplier-specific commercial data', () => {
    service.update(35, payload).subscribe();
    const request = http.expectOne(`${baseUrl}/product-suppliers/35`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('sets one relation as preferred', () => {
    service.setPreferred(35).subscribe();
    const request = http.expectOne(`${baseUrl}/product-suppliers/35/preferred`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeNull();
    request.flush({});
  });

  it('deactivates a relation without deleting its history', () => {
    service.deactivate(35).subscribe();
    const request = http.expectOne(`${baseUrl}/product-suppliers/35`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('searches a supplier code scoped to the selected provider', () => {
    service.search(3, ' 00125 ').subscribe();
    const request = http.expectOne(req =>
      req.url === `${baseUrl}/product-suppliers/search` &&
      req.params.get('providerId') === '3' &&
      req.params.get('supplierProductCode') === '00125'
    );
    expect(request.request.method).toBe('GET');
    request.flush({ found: true, productId: 42 });
  });
});
