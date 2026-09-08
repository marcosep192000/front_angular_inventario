import { RegistrarDetalleFacturaProveedorComponent } from './registrar-detalle-factura-proveedor.component';

describe('Supplier invoice canonical stock contract', () => {
  const component = Object.create(RegistrarDetalleFacturaProveedorComponent.prototype) as any;
  it('preserves decimal availability and minimum despite divergent legacy aliases', () => {
    const result = component.mapProductToBuy({ id: 1, name: 'Fraccionable', availableStock: 10.125,
      minimumStock: 2.75, stock: 999, stockMin: 888, price: 5, iva: 21 });
    expect(result.availableStock).toBe(10.125);
    expect(result.minimumStock).toBe(2.75);
    expect(result.totalStock).toBe(10.125);
    expect(result.stock).toBe(10.125);
  });
  it('never revives legacy availability when canonical quantity is zero', () => {
    const result = component.mapProductToBuy({ id: 1, name: 'Sin stock', availableStock: 0,
      minimumStock: 0, stock: 999, stockMin: 888 });
    expect(result.totalStock).toBe(0);
    expect(result.stockMin).toBe(0);
  });
});
