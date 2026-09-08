import { ListProductComponent } from './list-product.component';
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
