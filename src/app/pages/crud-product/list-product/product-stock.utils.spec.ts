import { stockStatus } from './product-stock.utils';
describe('stock moderno de lista', () => {
  it('clasifica cero y negativos sin stock', () => {
    for (const availableStock of [0, -0.5]) expect(stockStatus({availableStock, minimumStock: 2.5})).toBe('sin-stock');
  });
  it('clasifica decimal y l?mite como bajo stock', () => {
    for (const availableStock of [.5, 2.5]) expect(stockStatus({availableStock, minimumStock: 2.5})).toBe('stock-bajo');
  });
  it('respeta stock decimal moderno aunque el legacy difiera', () => {
    const product = {availableStock: 10.5, minimumStock: 2.5, stock: 0};
    expect(stockStatus(product)).toBe('stock-ok');
  });
});
