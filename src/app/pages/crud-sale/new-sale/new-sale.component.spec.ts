import { NewSaleComponent } from './new-sale.component';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { Subject } from 'rxjs';
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
  it('factura gramos con cantidad base y conserva la cantidad ingresada para mostrar', () => {
    const cfg=config({availableStock:20});
    const cases=[
      {input:500,base:.5,total:12772.20},
      {input:1,base:1,total:25544.40},
      {input:250,base:.25,total:6386.10},
    ];
    for(const value of cases){
      c.products=[];
      c.agregarProductoConfigurado(product({salePrice:25544.40}),cfg,selection({quantity:value.input,baseQuantity:value.base,conversionFactor:value.base/value.input,available:20,inputUnitId:2,unitPrice:25544.40,displayQuantity:`${value.input} g = ${value.base} kg`}));
      expect(c.products[0].quantity).toBe(value.input);
      expect(c.lineSubtotal(c.products[0])).toBeCloseTo(value.total,2);
    }
    c.products=[];
    c.agregarProductoConfigurado(product({salePrice:25544.40}),cfg,selection({quantity:500,baseQuantity:.5,conversionFactor:.001,available:20,inputUnitId:2,unitPrice:25544.40}));
    expect(c.remainingStock(c.products[0])).toBeCloseTo(19.5,6);
  });
  it('muestra metros comerciales sin cambiar el contrato centimetros + inputUnitId', () => {
    const cfg=config({availableStock:52,unit:{id:4,symbol:'m',dimension:'LENGTH'},allowedUnits:[{id:3,symbol:'cm',dimension:'LENGTH'}]});
    const cases=[
      {input:10, base:.1, total:810000},
      {input:25, base:.25, total:2025000},
      {input:50, base:.5, total:4050000},
      {input:1, base:1, total:8100000, unitId:4},
      {input:2, base:2, total:16200000, unitId:4},
    ];
    for (const value of cases) {
      c.products=[];
      c.agregarProductoConfigurado(product({salePrice:8100000}),cfg,selection({
        quantity:value.input,baseQuantity:value.base,conversionFactor:value.base/value.input,
        inputUnitId:value.unitId ?? 3,unitPrice:8100000,available:52,
      }));
      const item=c.products[0];
      expect(item.quantity).toBe(value.input);
      expect(item.inputUnitId).toBe(value.unitId ?? 3);
      expect(c.cartQuantity(item)).toBe(value.base);
      expect(item.cartUnitSymbol).toBe('m');
      expect(c.lineSubtotal(item)).toBe(value.total);
      expect(c.remainingStock(item)).toBeCloseTo(52-value.base,6);
    }
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
  it('una lectura móvil reutiliza onSubmit y no crea otra búsqueda', () => {
    c.code='';c.productosEncontrados=[product()];c.mostrarResultados=true;c.indiceSeleccionado=0;
    spyOn(c,'onSubmit');
    c.procesarBarcodeMovil('7791234567890');
    expect(c.code).toBe('7791234567890');
    expect(c.productosEncontrados).toEqual([]);
    expect(c.onSubmit).toHaveBeenCalledTimes(1);
  });
  it('al destruir Nueva Venta desconecta y cierra la sesión activa', () => {
    c.scannerSession={sessionId:'scanner-1'};c.scannerWebsocket=jasmine.createSpyObj('ws',['disconnect']);
    c.scannerService=jasmine.createSpyObj('scanner',['closeSession']);c.scannerService.closeSession.and.returnValue({subscribe:()=>undefined});
    c.ngOnDestroy();
    expect(c.scannerWebsocket.disconnect).toHaveBeenCalled();
    expect(c.scannerService.closeSession).toHaveBeenCalledWith('scanner-1');
  });
  it('bloquea doble envio y conserva requestId al reintentar un error', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    c.selectedClient={id:1};c.products=[];c.puntoCajaId=1;c.tipoDocumento='FACTURA_C';c.generarPdfAlGuardar=true;
    c.commonSale={saveCommon:jasmine.createSpy('saveCommon').and.returnValues(first,second)};
    const sale:any={client:1,ticketDetails:[],total:100,subTotal:100};
    c.saveCommonSale(sale);c.saveCommonSale(sale);
    expect(c.commonSale.saveCommon).toHaveBeenCalledTimes(1);
    const requestId=c.commonSale.saveCommon.calls.argsFor(0)[0].requestId;
    first.error({});c.saveCommonSale(sale);
    expect(c.commonSale.saveCommon.calls.argsFor(1)[0].requestId).toBe(requestId);
  });
});
