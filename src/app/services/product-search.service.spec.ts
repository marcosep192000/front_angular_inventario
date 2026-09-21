import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';

describe('ProductService sale search HTTP', () => {
  it('envia 0101 como string al endpoint comercial y conserva el orden', () => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(ProductService).searchForSale(' 0101 ').subscribe(result => {
      expect(result.map(p => p.barCode)).toEqual(['0101', 'X0101']);
    });
    const req = http.expectOne(r => r.url.endsWith('/supermarket/search-for-sale'));
    expect(req.request.params.get('query')).toBe('0101');
    req.flush([{ barCode: '0101' }, { barCode: 'X0101' }]); http.verify();
  });

  it('codifica caracteres especiales como parametros HTTP', () => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(ProductService).getProducts(2, 25, ` "%'_\\ `).subscribe();
    const req = http.expectOne(r => r.url.endsWith('/supermarket/products'));
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('25');
    expect(req.request.params.get('filter')).toBe(`"%'_\\`);
    req.flush({ content: [], totalElements: 0 }); http.verify();
  });
});
