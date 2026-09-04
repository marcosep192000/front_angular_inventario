import {
  baseQuantity,
  applyQuickQuantity,
  cartIdentity,
  estimatedTotal,
  hasEnoughStock,
  manualQuantityValid,
  normalizeDecimalInput,
  quickQuantityOptions,
  saleDetailPayload,
  unitConversionFactor,
  validVariants,
} from './sale-configuration.utils';
describe('configuración genérica de venta', () => {
  const kg: any = { id: 4, conversionFactor: 1000, salePrice: 8000 };
  it('calcula 500 g como media presentación base', () =>
    expect(baseQuantity(0.5, kg)).toBe(500));
  it('calcula 0.5 kg a $4000', () =>
    expect(estimatedTotal(0.5, 0, kg)).toBe(4000));
  it('calcula 7.5 metros', () => expect(baseQuantity(7.5, null)).toBe(7.5));
  it('calcula dos packs x6 como 12 unidades', () =>
    expect(baseQuantity(2, { conversionFactor: 6 } as any)).toBe(12));
  it('no fusiona variantes ni presentaciones diferentes', () => {
    expect(cartIdentity(1, null, 10)).not.toBe(cartIdentity(1, null, 11));
    expect(cartIdentity(1, 4, null)).not.toBe(cartIdentity(1, 5, null));
  });
  it('filtra combinaciones posibles', () => {
    const variants: any[] = [
      { active: true, attributes: { Color: 'Negro', Talle: '41' } },
      { active: true, attributes: { Color: 'Blanco', Talle: '42' } },
    ];
    expect(validVariants(variants, { Color: 'Negro' }, 'Talle')).toHaveSize(1);
  });
  it('conserva el payload tradicional', () =>
    expect(saleDetailPayload({ id: 10, quantity: 2 })).toEqual({
      idProduct: 10,
      amount: 2,
    }));
  it('genera el payload nuevo sin mezclar amount', () =>
    expect(
      saleDetailPayload({
        id: 10,
        quantity: 0.5,
        advancedSale: true,
        presentationId: 4,
        variantId: null,
        inputUnitId: 8,
      }),
    ).toEqual({
      idProduct: 10,
      quantity: 0.5,
      presentationId: 4,
      variantId: null,
      inputUnitId: null,
    }));
  it('bloquea una variante sin stock', () =>
    expect(hasEnoughStock(1, 0)).toBeFalse());
  const unit = (id: number, symbol: string, dimension: any, factor: number) =>
    ({ id, symbol, name: symbol, dimension, baseConversionFactor: factor, active: true }) as any;
  it('genera atajos WEIGHT solamente con allowedUnits', () => {
    const result = quickQuantityOptions('WEIGHT', [unit(7, 'g', 'WEIGHT', .001), unit(9, 'kg', 'WEIGHT', 1)]);
    expect(result.map(x => x.label)).toEqual(['100 g', '200 g', '250 g', '500 g', '1 kg']);
  });
  it('genera atajos LENGTH compatibles', () =>
    expect(quickQuantityOptions('LENGTH', [unit(3, 'cm', 'LENGTH', .01), unit(4, 'm', 'LENGTH', 1)])).toHaveSize(5));
  it('genera atajos VOLUME compatibles', () =>
    expect(quickQuantityOptions('VOLUME', [unit(5, 'ml', 'VOLUME', .001), unit(6, 'l', 'VOLUME', 1)])).toHaveSize(4));
  it('COUNT ofrece cantidades enteras', () =>
    expect(quickQuantityOptions('COUNT', [unit(1, 'un', 'COUNT', 1)]).map(x => x.quantity)).toEqual([1, 2, 3, 5, 10]));
  it('CUSTOM no inventa atajos', () =>
    expect(quickQuantityOptions('CUSTOM', [unit(2, 'cj', 'CUSTOM', 1)])).toEqual([]));
  it('convierte 200 g a 0.2 kg usando factores recibidos', () =>
    expect(200 * (unitConversionFactor(unit(7, 'g', 'WEIGHT', .001), unit(9, 'kg', 'WEIGHT', 1))!)).toBeCloseTo(.2));
  it('el atajo conserva el id real de la unidad', () => {
    const option = quickQuantityOptions('WEIGHT', [unit(73, 'g', 'WEIGHT', .001)])[1];
    expect(option).toEqual(jasmine.objectContaining({ quantity: 200, unitId: 73 }));
  });
  it('la entrada manual fraccionable admite 2.75', () =>
    expect(manualQuantityValid(2.75, true)).toBeTrue());
  it('fractionable=false rechaza decimales', () =>
    expect(manualQuantityValid(.5, false)).toBeFalse());
  it('un producto fraccionable admite 1.8 kg', () =>
    expect(manualQuantityValid('1.8', true)).toBeTrue());
  it('un producto no fraccionable rechaza 1.8', () =>
    expect(manualQuantityValid('1.8', false)).toBeFalse());
  it('normaliza punto decimal sin redondear', () =>
    expect(normalizeDecimalInput('1.35')).toBe(1.35));
  it('normaliza coma decimal sin redondear', () =>
    expect(normalizeDecimalInput('1,35')).toBe(1.35));
  it('acepta cantidades fraccionadas menores a uno', () => {
    expect(normalizeDecimalInput('0.5')).toBe(.5);
    expect(normalizeDecimalInput('0,250')).toBe(.25);
  });
  it('acepta enteros positivos', () =>
    expect(manualQuantityValid('1', false)).toBeTrue());
  it('rechaza cero y negativos', () => {
    expect(manualQuantityValid('0', true)).toBeFalse();
    expect(manualQuantityValid('-1', true)).toBeFalse();
  });
  it('un atajo no modifica presentación ni variante', () => {
    const state = { quantity: 1, selectedUnitId: 9, presentationId: 44, variantId: 82 };
    expect(applyQuickQuantity(state, { quantity: 200, unitId: 7, label: '200 g' }))
      .toEqual({ quantity: 200, selectedUnitId: 7, presentationId: 44, variantId: 82 });
  });
});
