import { normalizeOptionalBarcode } from './product-form.utils';

describe('normalizeOptionalBarcode', () => {
  it('normalizes an empty barcode to null', () => {
    expect(normalizeOptionalBarcode('   ')).toBeNull();
    expect(normalizeOptionalBarcode(null)).toBeNull();
  });

  it('preserves a real barcode without surrounding whitespace', () => {
    expect(normalizeOptionalBarcode('  002453  ')).toBe('002453');
  });
});
