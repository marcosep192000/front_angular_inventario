import { canUnlink, COMPARISON_STATUS, localDateValue, MATCH_TYPE, PRICE_LIST_STATUS, priceListError, reference } from './supplier-price-list.utils';
describe('supplier price list UI rules', () => {
  it('translates every status', () => { expect(PRICE_LIST_STATUS.DRAFT).toBe('Borrador'); expect(PRICE_LIST_STATUS.REVIEWED).toBe('Revisada'); expect(PRICE_LIST_STATUS.ARCHIVED).toBe('Archivada'); });
  it('translates matching types', () => { expect(MATCH_TYPE.UNMATCHED).toBe('Sin vincular'); expect(MATCH_TYPE.SUPPLIER_PRODUCT_CODE).toBe('Código proveedor'); expect(MATCH_TYPE.MANUAL_PRODUCT_LINK).toBe('Vinculado manualmente'); });
  it('allows unlinking manual matches only', () => { expect(canUnlink('MANUAL_PRODUCT_LINK')).toBeTrue(); expect(canUnlink('SUPPLIER_PRODUCT_CODE')).toBeFalse(); expect(canUnlink('SUPPLIER_BARCODE')).toBeFalse(); });
  it('renders null references as a dash', () => expect(reference(null)).toBe('—'));
  it('translates comparison indicators', () => { expect(COMPARISON_STATUS['INCREASED']).toBe('Subió'); expect(COMPARISON_STATUS['DECREASED']).toBe('Bajó'); expect(COMPARISON_STATUS['UNCHANGED']).toBe('Sin cambio'); });
  it('maps functional errors', () => { expect(priceListError({ error: { code: 'INVALID_PRICE_LIST_STATUS' } })).toContain('estado actual'); expect(priceListError({ error: { code: 'DUPLICATE_SUPPLIER_PRODUCT_CODE' } })).toContain('ya existe'); expect(priceListError({ status: 403 })).toContain('permisos'); });
  it('formats a calendar date without converting it to UTC', () => expect(localDateValue(new Date(2026, 8, 6, 23, 30))).toBe('2026-09-06'));
  it('maps creation validation details returned by the backend', () => { expect(priceListError({status:400,error:{referenceDate:'must not be null'}})).toContain('referencia'); expect(priceListError({status:400,error:{name:'must not be blank'}})).toContain('nombre'); expect(priceListError({status:400,error:{code:'PROVIDER_NOT_FOUND'}})).toContain('no existe'); });
  it('uses the backend message and only falls back for an opaque server error', () => { expect(priceListError({status:400,error:{message:'Detalle útil'}})).toBe('Detalle útil'); expect(priceListError({status:500,error:{error:'Internal Server Error'}})).toBe('Ocurrió un error al crear la lista de precios.'); });
});
