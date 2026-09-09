import { of } from 'rxjs';
import { ProductSuppliersDialogComponent } from './product-suppliers-dialog.component';

describe('Proveedores del producto sin cache', () => {
  it('consulta al abrir y al reabrir conserva ambos proveedores sin reload', () => {
    const a = { id: 1, providerId: 2, providerName: 'Iekons', active: true };
    const b = { id: 2, providerId: 3, providerName: 'Proveedor B', active: true };
    const api = jasmine.createSpyObj('suppliers', ['getByProduct']);
    api.getByProduct.and.returnValues(of([a]), of([a, b]));
    const open = () => new ProductSuppliersDialogComponent(
      { productId: 10, productName: 'Coca Cola Litro' }, api, {} as any, {} as any, {} as any,
    );
    const first = open(); first.ngOnInit();
    expect(first.activeRelations.map(r => r.providerName)).toEqual(['Iekons']);
    const second = open(); second.ngOnInit();
    expect(second.activeRelations.map(r => r.providerName)).toEqual(['Iekons', 'Proveedor B']);
    expect(api.getByProduct).toHaveBeenCalledTimes(2);
    expect(api.getByProduct).toHaveBeenCalledWith(10);
  });
});
