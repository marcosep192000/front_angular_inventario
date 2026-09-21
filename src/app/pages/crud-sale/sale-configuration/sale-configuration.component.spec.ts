import { SaleConfigurationComponent } from './sale-configuration.component';
describe('contrato de disponibilidad en configuraci?n de venta', () => {
  const unit:any={id:1, dimension:'COUNT',symbol:'un.',baseConversionFactor:1};
  const component = (extra:any={}) => new SaleConfigurationComponent({product:{salePrice:10} as any,
    config:{productId:1,productName:'Producto',unit,allowedUnits:[unit],stock:999,
      availableStock:10.5,minimumStock:2.5,fractionable:true,variantStockManaged:false,
      presentations:[],variants:[],...extra}}, {close:()=>{}} as any);
  it('producto normal usa decimal moderno', () => {
    const c=component();c.quantity=1.25;expect(c.available).toBe(10.5);expect(c.valid).toBeTrue();
  });
  it('Negra 2 no usa agregado 102, incluso antes de seleccionar', () => {
    const c=component({availableStock:102,variantStockManaged:true,variants:[
      {id:1,stock:2,active:true,attributes:{Color:'Negra'}},
      {id:2,stock:100,active:true,attributes:{Color:'Blanca'}}]});
    expect(c.available).toBe(0);expect(c.valid).toBeFalse();
    c.selectedAttributes={Color:'Negra'};c.quantity=3;
    expect(c.available).toBe(2);expect(c.valid).toBeFalse();c.quantity=2;expect(c.valid).toBeTrue();
  });
  it('presentaci?n caja x4 compara 12 unidades con 10', () => {
    const c=component({availableStock:10,presentations:[{id:1,name:'Caja',active:true,saleEnabled:true,defaultSale:true,conversionFactor:4}]});
    c.quantity=3;expect(c.requestedBase).toBe(12);expect(c.valid).toBeFalse();
  });
  it('el atajo 50 cm mantiene seleccionado cm y equivale a 0.50 m', () => {
    const meter={id:4,dimension:'LENGTH',symbol:'m',baseConversionFactor:1};
    const centimeter={id:3,dimension:'LENGTH',symbol:'cm',baseConversionFactor:.01};
    const c=component({unit:meter,allowedUnits:[centimeter,meter],availableStock:52});
    const quick50=c.quickOptions.find((option:any)=>option.label==='50 cm')!;
    c.selectQuickQuantity(quick50);
    expect(c.quantity).toBe(50);expect(c.selectedUnitId).toBe(3);
    expect(c.isQuickSelected(quick50)).toBeTrue();
    expect(c.requestedBase).toBe(.5);expect(c.equivalence).toContain('50 cm = 0.500 m');
  });
});
