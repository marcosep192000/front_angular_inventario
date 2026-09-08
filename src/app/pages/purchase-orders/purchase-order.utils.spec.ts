import { buildReceiveRequest, purchaseOrderActions, purchaseOrderLineIdentity } from './purchase-order.utils';
describe('purchase order rules', () => {
  it('allows only valid actions for a draft', () => expect(purchaseOrderActions('DRAFT')).toEqual({ edit: true, send: true, receive: false, cancel: true }));
  it('allows receiving a partially received order', () => expect(purchaseOrderActions('PARTIALLY_RECEIVED').receive).toBeTrue());
  it('blocks actions for a received order', () => expect(purchaseOrderActions('RECEIVED')).toEqual({ edit: false, send: false, receive: false, cancel: false }));
  it('omits zero and quantities above pending', () => expect(buildReceiveRequest([{ id: 1, pendingQuantity: 5 }, { id: 2, pendingQuantity: 2 }, { id: 3, pendingQuantity: 4 }], { 1: 3, 2: 0, 3: 8 })).toEqual([{ purchaseOrderDetailId: 1, quantityReceivedNow: 3 }]));
  it('preserves decimal receipt quantities',()=>expect(buildReceiveRequest([{id:1,pendingQuantity:1.5}],{1:0.25})).toEqual([{purchaseOrderDetailId:1,quantityReceivedNow:0.25}]));
  it('keeps two variants of the same product as distinct lines',()=>expect(new Set([purchaseOrderLineIdentity({productId:7,variantId:10}),purchaseOrderLineIdentity({productId:7,variantId:11})]).size).toBe(2));
  it('sends receipts by detail id even when products are shared',()=>expect(buildReceiveRequest([{id:101,pendingQuantity:5},{id:102,pendingQuantity:8}],{101:3,102:8})).toEqual([{purchaseOrderDetailId:101,quantityReceivedNow:3},{purchaseOrderDetailId:102,quantityReceivedNow:8}]));
});
