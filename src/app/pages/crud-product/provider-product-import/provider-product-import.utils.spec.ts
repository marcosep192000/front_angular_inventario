import {
  autoMapProviderProduct,
  backendRowToUi,
  commercialMoney,
  percentage,
  providerImportFileAccepted,
  uiRowToBackend,
} from './provider-product-import.utils';
describe('Provider product import helpers', () => {
  it('accepts Excel files only', () => {
    expect(providerImportFileAccepted(new File([], 'x.XLSX'))).toBeTrue();
    expect(providerImportFileAccepted(new File([], 'x.csv'))).toBeFalse();
  });
  it('converts visible header rows to backend indexes', () => {
    expect(uiRowToBackend(1)).toBe(0);
    expect(backendRowToUi(2)).toBe(3);
  });
  it('maps the real supplier headers conservatively', () => {
    const m = autoMapProviderProduct([
      'CODIGO',
      'descripcion',
      'iva',
      'PRECIO',
      'utilidad-ganancia',
    ]);
    expect(m.supplierProductCodeColumn).toBe('CODIGO');
    expect(m.nameColumn).toBe('descripcion');
    expect(m.ivaColumn).toBe('iva');
    expect(m.purchasePriceColumn).toBe('PRECIO');
    expect(m.profitPercentageColumn).toBe('utilidad-ganancia');
    expect(m.supplierBarcodeColumn).toBeNull();
    expect(m.productBarcodeColumn).toBeNull();
  });
  it('shows commercial prices with two decimals', () => {
    expect(commercialMoney(3258.41)).toContain('3.258,41');
    expect(commercialMoney(404.09)).toContain('404,09');
  });
  it('shows profit as percentage', () => expect(percentage(30)).toBe('30 %'));
});
