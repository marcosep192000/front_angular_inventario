import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { InventorySupplierReportService } from './inventory-supplier-report.service';

describe('InventorySupplierReportService', () => {
  let service: InventorySupplierReportService; let http: HttpTestingController;
  const base = `${environments.baseURL}inventory/reports`;
  beforeEach(()=>{TestBed.configureTestingModule({imports:[HttpClientTestingModule]});service=TestBed.inject(InventorySupplierReportService);http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());
  it('builds supplier comparison GET',()=>{service.getProductComparison(7).subscribe();const r=http.expectOne(x=>x.url===`${base}/products/7/supplier-comparison`&&x.params.get('includeInactive')==='false');expect(r.request.method).toBe('GET');r.flush({});});
  it('builds bulk comparison request',()=>{service.compareProducts([1,2]).subscribe();const r=http.expectOne(`${base}/supplier-comparison`);expect(r.request.method).toBe('POST');expect(r.request.body).toEqual({productIds:[1,2]});r.flush([]);});
  it('sends history filters and real pagination',()=>{service.getCostHistory(4,{providerId:9,from:'2026-01-01',to:'2026-02-01',page:2,size:20}).subscribe();const r=http.expectOne(x=>x.url===`${base}/products/4/cost-history`);expect(r.request.params.get('providerId')).toBe('9');expect(r.request.params.get('from')).toBe('2026-01-01');expect(r.request.params.get('to')).toBe('2026-02-01');expect(r.request.params.get('page')).toBe('2');r.flush({contenido:[]});});
  it('loads provider purchase summary with filters',()=>{service.getProviderPurchaseSummary({providerId:3,from:'2026-01-01'}).subscribe();const r=http.expectOne(x=>x.url===`${base}/providers/purchases`&&x.params.get('providerId')==='3');expect(r.request.method).toBe('GET');r.flush([]);});
  it('loads paginated provider invoices and products',()=>{service.getProviderPurchases(3,{page:1,size:10}).subscribe();http.expectOne(x=>x.url===`${base}/providers/3/purchases`&&x.params.get('page')==='1').flush({contenido:[]});service.getProviderProducts(3,{search:'clavo',preferredOnly:true,withPriceOnly:true,page:0,size:10}).subscribe();const r=http.expectOne(x=>x.url===`${base}/providers/3/products`);expect(r.request.params.get('preferredOnly')).toBe('true');expect(r.request.params.get('withPriceOnly')).toBe('true');r.flush({contenido:[]});});
  it('loads a real alerts page',()=>{service.getCostAlerts(3,50).subscribe();const r=http.expectOne(x=>x.url===`${base}/products/cost-alerts`&&x.params.get('page')==='3'&&x.params.get('size')==='50');expect(r.request.method).toBe('GET');r.flush({contenido:[]});});
  it('preserves decimal quantities in savings request',()=>{service.calculatePotentialSavings([{productId:2,quantity:1.5}]).subscribe();const r=http.expectOne(`${base}/potential-savings`);expect(r.request.body).toEqual({items:[{productId:2,quantity:1.5}]});r.flush({items:[]});});
});
