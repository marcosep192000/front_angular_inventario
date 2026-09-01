import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { PurchaseOrderStatus, PurchaseOrderSummary } from '../../interfaces/purchase-order';
import { Supplier } from '../../interfaces/supplier';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { SupplierService } from '../../services/supplier.service';
import { PurchaseOrderReceiveDialogComponent } from './purchase-order-receive-dialog.component';

@Component({ selector: 'app-purchase-order-list', standalone: true, imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule], templateUrl: './purchase-order-list.component.html', styleUrl: './purchase-orders.css' })
export class PurchaseOrderListComponent implements OnInit {
  readonly statuses: PurchaseOrderStatus[] = ['DRAFT','PENDING_APPROVAL','SENT','PARTIALLY_RECEIVED','RECEIVED','CANCELLED'];
  orders: PurchaseOrderSummary[] = []; suppliers: Supplier[] = []; loading = false; processingId: number | null = null;
  search = ''; providerId?: number; status?: PurchaseOrderStatus; dateFrom = ''; dateTo = ''; page = 0; size = 10; total = 0;
  private readonly search$ = new Subject<string>(); private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: PurchaseOrderService, private readonly supplierApi: SupplierService, private readonly router: Router, private readonly dialog: MatDialog, private readonly toastr: ToastrService) {}
  ngOnInit(): void { this.supplierApi.getAllSuppliers().subscribe({ next: data => this.suppliers = data }); this.search$.pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.page = 0; this.load(); }); this.load(); }
  load(): void { this.loading = true; this.api.getPurchaseOrders({ providerId: this.providerId, status: this.status, productSearch: this.search, dateFrom: this.dateFrom, dateTo: this.dateTo, page: this.page, size: this.size, sort: 'createdAt,desc' }).subscribe({ next: data => { this.orders = data.contenido; this.total = data.totalElementos; this.loading = false; }, error: error => { this.loading = false; this.error(error); } }); }
  searchChanged(): void { this.search$.next(this.search.trim()); }
  filterChanged(): void { this.page = 0; this.load(); }
  pageChanged(event: PageEvent): void { this.page = event.pageIndex; this.size = event.pageSize; this.load(); }
  edit(order: PurchaseOrderSummary): void { this.router.navigate(['/dashboard/purchase-orders', order.id, 'edit']); }
  send(order: PurchaseOrderSummary): void { if (!confirm(`¿Marcar ${order.orderNumber} como enviado?`)) return; this.processingId = order.id; this.api.sendPurchaseOrder(order.id).subscribe({ next: () => { this.processingId = null; this.toastr.success('Pedido marcado como enviado.'); this.load(); }, error: e => { this.processingId = null; this.error(e); this.load(); } }); }
  cancel(order: PurchaseOrderSummary): void { const observation = prompt('Motivo de cancelación (opcional):') ?? undefined; if (observation === undefined) return; this.processingId = order.id; this.api.cancelPurchaseOrder(order.id, { observation }).subscribe({ next: () => { this.processingId = null; this.toastr.success('Pedido cancelado.'); this.load(); }, error: e => { this.processingId = null; this.error(e); this.load(); } }); }
  receive(order: PurchaseOrderSummary): void { this.dialog.open(PurchaseOrderReceiveDialogComponent, { width: '850px', maxWidth: '95vw', data: { orderId: order.id } }).afterClosed().subscribe(ok => { if (ok) this.load(); }); }
  canEdit(s: PurchaseOrderStatus): boolean { return s === 'DRAFT'; } canSend(s: PurchaseOrderStatus): boolean { return s === 'DRAFT' || s === 'PENDING_APPROVAL'; } canReceive(s: PurchaseOrderStatus): boolean { return s === 'SENT' || s === 'PARTIALLY_RECEIVED'; } canCancel(s: PurchaseOrderStatus): boolean { return !['RECEIVED','CANCELLED'].includes(s); }
  statusLabel(s: PurchaseOrderStatus): string { return ({DRAFT:'Borrador',PENDING_APPROVAL:'Pendiente de aprobación',SENT:'Enviado',PARTIALLY_RECEIVED:'Recepción parcial',RECEIVED:'Recibido',CANCELLED:'Cancelado'} as Record<PurchaseOrderStatus,string>)[s]; }
  private error(error: unknown): void { const e = error as { error?: { message?: string } }; this.toastr.error(e.error?.message || 'No se pudo completar la operación.'); }
}
