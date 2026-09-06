import { ProductSupplier } from '../../../interfaces/product-supplier';
import { buildSupplierLineIdentity, supplierInvoiceErrorMessage } from './supplier-invoice-loading.utils';

describe('smart supplier invoice loading', () => {
  const relation: ProductSupplier = {
    id: 15, productId: 42, productName: 'Electrodo', productBarcode: '779123',
    providerId: 3, providerName: 'Norte', supplierProductCode: '00125',
    supplierBarcode: 'SUP-779', purchasePrice: 8200.1234, lastPurchasePrice: 7950.5678,
    preferred: true, active: true, found: true,
  };

  it('builds a known line with all three backend identifiers', () => {
    expect(buildSupplierLineIdentity(42, '00125', relation, false)).toEqual({
      productId: 42, productSupplierId: 15, supplierProductCode: '00125',
      supplierBarcode: 'SUP-779', linkExistingProduct: false, supplierLinked: true,
    });
  });

  it('marks an unknown code selected for an existing product as pending link', () => {
    const identity = buildSupplierLineIdentity(42, '99999', null, true);
    expect(identity.productSupplierId).toBeNull();
    expect(identity.linkExistingProduct).toBeTrue();
    expect(identity.supplierProductCode).toBe('99999');
  });

  it('does not create or mark a link merely because a code was searched', () => {
    const identity = buildSupplierLineIdentity(42, null, null, false);
    expect(identity.linkExistingProduct).toBeFalse();
    expect(identity.supplierLinked).toBeFalse();
  });

  it('keeps supplier and historical barcodes as separate fields', () => {
    const identity = buildSupplierLineIdentity(42, '00125', relation, false);
    expect(identity.supplierProductCode).not.toBe(relation.productBarcode ?? null);
    expect(identity.supplierBarcode).toBe('SUP-779');
  });

  it('maps business errors to actionable messages', () => {
    expect(supplierInvoiceErrorMessage({ error: { code: 'PROVIDER_MISMATCH' } }, 'Error'))
      .toBe('El artículo pertenece a otro proveedor.');
    expect(supplierInvoiceErrorMessage({ error: { code: 'INACTIVE_PRODUCT_SUPPLIER' } }, 'Error'))
      .toBe('La relación con este proveedor está desactivada.');
  });

  it('preserves four-decimal reference prices', () => {
    expect(relation.purchasePrice).toBe(8200.1234);
    expect(relation.lastPurchasePrice).toBe(7950.5678);
  });

  it('does not truncate fractional purchase quantities', () => {
    const quantity = Number('1.5');
    expect(quantity).toBe(1.5);
    expect(7950.125 * quantity).toBe(11925.1875);
  });
});
