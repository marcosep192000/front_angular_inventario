import {
  baseUnitRequest,
  inventoryBaseFormState,
} from './inventory-config.utils';

describe('configuración base de inventario', () => {
  const config = (fractionable: boolean): any => ({
    unit: { id: '8', name: 'KILOGRAMO', symbol: 'kg' },
    stock: 999,
    availableStock: 18.7,
    minimumStock: 2,
    fractionable,
    variantStockManaged: false,
  });

  it('carga marcado cuando fractionable=true', () =>
    expect(inventoryBaseFormState(config(true)).fractionable).toBeTrue());

  it('carga desmarcado cuando fractionable=false', () =>
    expect(inventoryBaseFormState(config(false)).fractionable).toBeFalse());

  it('normaliza el id y envía fractionable=true', () => {
    const state = inventoryBaseFormState(config(false));
    state.fractionable = true;
    expect(baseUnitRequest(state)).toEqual({
      unitId: 8,
      stock: 18.7,
      minimumStock: 2,
      fractionable: true,
      variantStockManaged: false,
    });
  });

  it('conserva fractionable=true al volver a cargar', () => {
    const reopened = inventoryBaseFormState(config(true));
    expect(reopened.fractionable).toBeTrue();
  });
});
