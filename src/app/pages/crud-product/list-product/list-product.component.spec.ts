import { ListProductComponent } from './list-product.component';
import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
describe('listado con contrato moderno', () => {
  const c=Object.create(ListProductComponent.prototype) as ListProductComponent;
  it('muestra suma activa recibida del backend sin recalcular legacy', () => {
    const p:any={availableStock:13,minimumStock:2,stock:113,variantStockManaged:true};
    expect(c.textoStock(p)).toBe('13 un. en variantes');expect(c.claseStock(p)).toBe('stock-ok');
  });
  it('muestra decimal con unidad base', () => {
    expect(c.textoStock({availableStock:10.5,minimumStock:2.5,baseUnit:{symbol:'kg'}} as any)).toBe('10,5 kg');
  });
});

describe('listado: busqueda backend permisiva', () => {
  let c: any;
  const original = { id: 1, barCode: '0101', name: 'Coca Cola "Zero" 1,5L' };

  beforeEach(() => {
    c = Object.create(ListProductComponent.prototype);
    c.pageSize = 10; c.pageIndex = 0; c.totalElements = 0;
    c.searchTerm = ''; c.filterValue = ''; c.searchSubject = new Subject<string>();
    c.dataSource = { data: [] };
    c.productService = jasmine.createSpyObj('products', ['getProducts']);
    c.productService.getProducts.and.returnValue(of({ content: [original], totalElements: 1 }));
    c.ngOnInit();
    c.productService.getProducts.calls.reset();
  });

  it('normaliza bordes y espacios multiples antes de consultar', fakeAsync(() => {
    c.onSearchChange('  coca   cola zero  '); tick(400);
    expect(c.productService.getProducts).toHaveBeenCalledWith(0, 10, 'coca cola zero');
  }));

  it('envia comillas, guion y barcode como strings seguros', fakeAsync(() => {
    for (const query of ['coca "cola"', 'coca-zero', '0101']) {
      c.onSearchChange(query); tick(400);
      expect(c.productService.getProducts).toHaveBeenCalledWith(0, 10, query);
    }
  }));

  it('limpiar recupera la primera pagina sin filtro', fakeAsync(() => {
    c.onSearchChange('coca'); tick(400); c.onSearchChange('   '); tick(400);
    expect(c.productService.getProducts).toHaveBeenCalledWith(0, 10, '');
    expect(c.pageIndex).toBe(0);
  }));

  it('pagina conservando el filtro normalizado', fakeAsync(() => {
    c.onSearchChange(' coca   zero '); tick(400); c.productService.getProducts.calls.reset();
    c.onPageChange({ pageIndex: 2, pageSize: 25 } as any);
    expect(c.productService.getProducts).toHaveBeenCalledWith(2, 25, 'coca zero');
  }));

  it('una respuesta atrasada no reemplaza la busqueda nueva', fakeAsync(() => {
    const oldResponse = new Subject<any>(); const newResponse = new Subject<any>();
    c.productService.getProducts.and.returnValues(oldResponse, newResponse);
    c.onSearchChange('vieja'); tick(400); c.onSearchChange('nueva'); tick(400);
    newResponse.next({ content: [original], totalElements: 1 });
    oldResponse.next({ content: [{ name: 'Obsoleto' }], totalElements: 1 });
    expect(c.dataSource.data).toEqual([original]);
  }));

  it('conserva el nombre original presentado', fakeAsync(() => {
    c.onSearchChange('coca zero'); tick(400);
    expect(c.dataSource.data[0].name).toBe('Coca Cola "Zero" 1,5L');
  }));
});
