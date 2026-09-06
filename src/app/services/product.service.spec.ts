import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environments } from '../../environments/environments';
import { ProductService } from './product.service';

describe('ProductService invoice administrative lookup', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads an imported product by its administrative id when barcode is null', () => {
    let result: any;
    service.findById(47).subscribe(product => (result = product));

    const request = http.expectOne(
      `${environments.baseURL}supermarket/find/47`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ id: 47, name: 'Producto importado', barCode: null });

    expect(result.id).toBe(47);
    expect(result.barCode).toBeNull();
  });

  it('finds an exact barcode through the administrative list even with zero stock', () => {
    let result: any;
    service.findAdministrativeByBarcode(' 00125 ').subscribe(product => (result = product));

    const request = http.expectOne(
      `${environments.baseURL}supermarket/products?page=0&size=20&filter=00125`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      content: [
        { id: 1, name: 'Otro', barCode: '125', stock: 10 },
        { id: 2, name: 'Sin stock', barCode: '00125', stock: 0 },
      ],
    });

    expect(result.id).toBe(2);
    expect(result.barCode).toBe('00125');
    expect(result.stock).toBe(0);
  });
});
