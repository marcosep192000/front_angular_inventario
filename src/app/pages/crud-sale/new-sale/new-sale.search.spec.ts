import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { NewSaleComponent } from './new-sale.component';

describe('Nueva Venta: busqueda comercial', () => {
  let c: any;
  const coca = { id: 1, name: 'Coca Cola Litro', barCode: '0101' };
  beforeEach(() => {
    c = Object.create(NewSaleComponent.prototype);
    c.code = ''; c.productosEncontrados = []; c.indiceSeleccionado = -1;
    c.busquedaProducto$ = new Subject<string>();
    c.productService = jasmine.createSpyObj('products', ['searchForSale']);
    c.productService.searchForSale.and.returnValue(of([coca]));
    c.toastr = jasmine.createSpyObj('toast', ['warning', 'error']);
    spyOn(c, 'seleccionarProducto');
    c.inicializarBuscador();
  });
  function input(value: string) { c.code = value; c.buscarProductos(value); }

  it('consulta nombre parcial y codigo sin perder ceros', fakeAsync(() => {
    input('coca'); tick(300);
    expect(c.productService.searchForSale).toHaveBeenCalledWith('coca');
    expect(c.productosEncontrados).toEqual([coca]);
    input(' 0101 '); tick(300);
    expect(c.productService.searchForSale).toHaveBeenCalledWith('0101');
    expect(c.productosEncontrados[0].barCode).toBe('0101');
  }));

  it('Enter del lector antes del debounce consulta y selecciona', fakeAsync(() => {
    input('0101'); c.manejarTeclado(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(c.productService.searchForSale).toHaveBeenCalledWith('0101');
    expect(c.seleccionarProducto).toHaveBeenCalledWith(coca);
    expect(c.toastr.warning).not.toHaveBeenCalled(); tick(300);
  }));

  it('cambiar el texto impide seleccionar resultados anteriores', fakeAsync(() => {
    input('otro'); tick(300);
    input('0101');
    expect(c.productosEncontrados).toEqual([]);
    c.onSubmit();
    expect(c.productService.searchForSale).toHaveBeenCalledWith('0101'); tick(300);
  }));

  it('limpiar oculta inmediatamente y descarta respuestas pendientes', fakeAsync(() => {
    const pending = new Subject<any[]>();
    c.productService.searchForSale.and.returnValue(pending);
    input('0101'); tick(300); input(''); pending.next([coca]);
    expect(c.productosEncontrados).toEqual([]);
    expect(c.mostrarResultados).toBeFalse(); tick(300);
    expect(c.productService.searchForSale).toHaveBeenCalledTimes(1);
  }));

  it('descarta tambien una respuesta manual si cambio el input', fakeAsync(() => {
    const pending = new Subject<any[]>();
    c.productService.searchForSale.and.returnValue(pending);
    input('0101'); c.onSubmit(); input(''); pending.next([coca]);
    expect(c.seleccionarProducto).not.toHaveBeenCalled(); tick(300);
  }));

  it('scanner movil conserva el codigo principal como string', () => {
    c.procesarBarcodeMovil('0101');
    expect(c.productService.searchForSale).toHaveBeenCalledWith('0101');
    expect(c.seleccionarProducto).toHaveBeenCalledWith(coca);
  });

  it('permite buscar el mismo codigo despues de una seleccion que limpia el campo', fakeAsync(() => {
    input('0101'); tick(300);
    c.code = ''; c.productosEncontrados = [];
    input('0101'); tick(300);
    expect(c.productService.searchForSale).toHaveBeenCalledTimes(2);
    expect(c.productosEncontrados).toEqual([coca]);
  }));
});
