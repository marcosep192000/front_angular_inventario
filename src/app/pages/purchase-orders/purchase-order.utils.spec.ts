import { buildReceiveRequest, purchaseOrderActions } from './purchase-order.utils';
describe('purchase order rules', () => {
  it('allows only valid actions for a draft', () => expect(purchaseOrderActions('DRAFT')).toEqual({ edit: true, send: true, receive: false, cancel: true }));
  it('allows receiving a partially received order', () => expect(purchaseOrderActions('PARTIALLY_RECEIVED').receive).toBeTrue());
  it('blocks actions for a received order', () => expect(purchaseOrderActions('RECEIVED')).toEqual({ edit: false, send: false, receive: false, cancel: false }));
  it('omits zero and quantities above pending', () => expect(buildReceiveRequest([{ id: 1, pendingQuantity: 5 }, { id: 2, pendingQuantity: 2 }, { id: 3, pendingQuantity: 4 }], { 1: 3, 2: 0, 3: 8 })).toEqual([{ purchaseOrderDetailId: 1, quantityReceivedNow: 3 }]));
});
