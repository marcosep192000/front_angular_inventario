import { Pipe, PipeTransform } from '@angular/core';
import { PurchaseOrderDetail } from '../../interfaces/purchase-order';
@Pipe({ name: 'poSum', standalone: true })
export class PoSumPipe implements PipeTransform { transform(items: PurchaseOrderDetail[], field: 'requestedQuantity' | 'pendingQuantity'): number { return items.reduce((sum, item) => sum + item[field], 0); } }
