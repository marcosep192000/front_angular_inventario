import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService stock paginado', () => {
  it('solicita sólo diez DTOs modernos al backend', () => {
    TestBed.configureTestingModule({imports:[HttpClientTestingModule]});
    const service=TestBed.inject(DashboardService),http=TestBed.inject(HttpTestingController);
    service.getProductosBajoStock().subscribe(rows=>expect(rows[0].availableStock).toBe(7.5));
    const req=http.expectOne(r=>r.url.endsWith('/supermarket/low-stock'));
    expect(req.request.params.get('size')).toBe('10');expect(req.request.params.get('page')).toBe('0');
    req.flush({content:[{productId:1,barCode:null,availableStock:7.5,minimumStock:8}],totalElements:10000});http.verify();
  });
});
