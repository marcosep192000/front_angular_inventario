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
});
