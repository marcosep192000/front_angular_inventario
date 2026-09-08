import { NewSaleComponent } from './new-sale.component';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
describe('carrito de NewSaleComponent', () => {
  let c:any;
  beforeEach(() => {
    c=Object.create(NewSaleComponent.prototype);c.products=[];
    c.toastr=jasmine.createSpyObj('toast',['warning','error','success']);
  });
  const product=(extra:any={})=>({id:1,name:'Producto',barCode:null,availableStock:10.5,minimumStock:2.5,stock:999,...extra});
  const config=(extra:any={})=>({availableStock:10.5,minimumStock:2.5,variants:[],presentations:[],allowedUnits:[],variantStockManaged:false,...extra});
  const selection=(extra:any={})=>({quantity:1.25,baseQuantity:1.25,conversionFactor:1,available:10.5,inputUnitId:1,presentationId:null,variantId:null,unitPrice:5,...extra});
  it('normal sin barcode usa stock moderno al agregar y aumentar', () => {
    c.agregarProducto(product({availableStock:1}));c.increaseQuantity(c.products[0]);
    expect(c.products[0].quantity).toBe(1);expect(c.toastr.warning).toHaveBeenCalled();
  });
  it('variante Negra usa 2 y no suma total 102', () => {
    c.agregarProductoConfigurado(product(),config({availableStock:102,variantStockManaged:true,variants:[{id:7,stock:2,active:true,attributes:{Color:'Negra'}}]}),selection({variantId:7,quantity:3,baseQuantity:3,available:102}));
    expect(c.products.length).toBe(0);
  });
  it('presentaci?n no compara cajas con unidades', () => {
    c.agregarProductoConfigurado(product(),config({availableStock:10}),selection({quantity:3,baseQuantity:12,conversionFactor:4,presentationId:2}));
    expect(c.products.length).toBe(0);
  });
  it('restante fraccionable conserva 9.25', () => {
    c.agregarProductoConfigurado(product(),config(),selection());
    expect(c.remainingStock(c.products[0])).toBe(9.25);
  });
  it('acumula 0.1 + 0.2 sin un segundo rechazo por redondeo binario', () => {
    const cfg=config({availableStock:.3});
    c.agregarProductoConfigurado(product(),cfg,selection({quantity:.1,baseQuantity:.1,available:.3}));
    c.agregarProductoConfigurado(product(),cfg,selection({quantity:.2,baseQuantity:.2,available:.3}));
    expect(c.products[0].baseQuantity).toBeCloseTo(.3,6);
    expect(c.toastr.warning).not.toHaveBeenCalled();
  });
  it('mantiene visible el resultado activo al navegar una lista extensa', fakeAsync(() => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    c.resultadosProducto = { get: (index:number) => index === 7 ? { nativeElement: { scrollIntoView } } : undefined };
    c.indiceSeleccionado = 6;c.mostrarResultados = true;c.productosEncontrados = Array.from({length:12},(_,id)=>product({id}));
    c.manejarTeclado(new KeyboardEvent('keydown',{key:'ArrowDown'}));flushMicrotasks();
    expect(c.indiceSeleccionado).toBe(7);
    expect(scrollIntoView).toHaveBeenCalledWith({block:'nearest'});
    expect(c.productosEncontrados.length).toBe(12);
  }));
});
