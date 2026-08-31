export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
export interface PageResponse<T> { contenido: T[]; pagina: number; tamanio: number; totalElementos: number; totalPaginas: number; }
export interface PurchaseOrderProvider { id: number; name: string; cuit: string; }
export interface PurchaseProductCandidate { productId: number; name: string; code: string; barCode: string; providerId: number; providerName: string; currentStock: number; minimumStock: number; suggestedQuantity: number; estimatedUnitCost: number; lowStock: boolean; }
export interface PurchaseOrderSummary { id: number; orderNumber: string; provider: PurchaseOrderProvider; status: PurchaseOrderStatus; createdAt: string; updatedAt: string; sentAt: string | null; receivedAt: string | null; observation: string; estimatedTotal: number; detailsCount?: number; }
export interface PurchaseOrderDetail { id: number; productId: number; productName: string; code: string; barCode: string; requestedQuantity: number; receivedQuantity: number; pendingQuantity: number; stockAtOrderTime: number; estimatedUnitCost: number; subtotal: number; observation: string; }
export interface PurchaseOrder extends PurchaseOrderSummary { details: PurchaseOrderDetail[]; }
export interface CreatePurchaseOrderDetailRequest { productId: number; requestedQuantity: number; observation: string; }
export interface CreatePurchaseOrderRequest { providerId: number; observation: string; details: CreatePurchaseOrderDetailRequest[]; }
export type UpdatePurchaseOrderRequest = CreatePurchaseOrderRequest;
export interface ReceivePurchaseOrderDetailRequest { purchaseOrderDetailId: number; quantityReceivedNow: number; }
export interface ReceivePurchaseOrderRequest { details: ReceivePurchaseOrderDetailRequest[]; }
export interface PurchaseOrderFilters { providerId?: number; status?: PurchaseOrderStatus; productSearch?: string; dateFrom?: string; dateTo?: string; page?: number; size?: number; sort?: string; }
export interface PurchaseProductFilters { providerId?: number; productSearch?: string; lowStockOnly?: boolean; page?: number; size?: number; sort?: string; }
export interface PurchaseOrderActionRequest { observation?: string; }
export interface PurchaseOrderApiError { error: string; message: string; }
