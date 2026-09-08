import { canAddBaseStock, effectiveCartStock, reservedBaseStock } from './cart-stock.utils';
import { ProductItemSale } from '../../../interfaces/ProductItemSale';
describe('disponibilidad de carrito en unidad base', () => {
 const product = (extra: Partial<ProductItemSale> = {}) => ({ id: 1, availableStock: 10.5, minimumStock: 2.5, stock: 999, quantity: 1.25, baseQuantity: 1.25, ...extra } as ProductItemSale);
 it('usa availableStock y conserva 10.500 - 1.250 = 9.250', () => {
   const p = product(); expect(effectiveCartStock(p) - reservedBaseStock([p],p)).toBe(9.25);
 });
 it('Negra 2 y Blanca 100: Negra jam?s vende 3 contra el total 102', () => {
   const p = product({availableStock: 102, variantStockManaged: true, variantId: 7, variantStock: 2});
   expect(canAddBaseStock([],p,3)).toBeFalse(); expect(canAddBaseStock([],p,2)).toBeTrue();
 });
 it('variante sin selecci?n o sin stock expl?cito falla cerrada', () => {
   expect(effectiveCartStock(product({variantStockManaged:true}))).toBe(0);
   expect(effectiveCartStock(product({variantId:7}))).toBe(0);
 });
 it('3 cajas x4 requieren 12: supera stock 10', () => {
   expect(canAddBaseStock([],product({availableStock:10}),3*4)).toBeFalse();
 });
 it('comparte disponibilidad entre presentaciones, separa variantes', () => {
   const p = product({variantId:7, variantStock:10, presentationId:1, baseQuantity:8});
   expect(canAddBaseStock([p],{...p,presentationId:2},4)).toBeFalse();
   expect(canAddBaseStock([p],{...p,variantId:8},4)).toBeTrue();
 });
 it('producto sin barcode se identifica por id', () => {
   const p=product({barCode:''}); expect(canAddBaseStock([],p,1.25)).toBeTrue();
 });
});
