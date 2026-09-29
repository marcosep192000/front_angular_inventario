import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from 'rxjs';
import {
  ClientOption,
  CloudOrderDetail,
  CloudOrderStatus,
  CloudOrderSummary,
  CloudVariant,
} from '../../interfaces/cloud-order';
import { CloudOrderService } from '../../services/cloud-order.service';
import { CajaService } from '../../services/caja.service';
import { PuntoCaja } from '../../interfaces/punto-caja';
@Component({
  selector: 'app-cloud-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
  ],
  templateUrl: './cloud-orders.component.html',
  styleUrl: './cloud-orders.component.css',
})
export class CloudOrdersComponent implements OnInit {
  readonly statuses: CloudOrderStatus[] = [
    'PENDING_REVIEW',
    'REVIEW_REQUIRED',
    'ACCEPTED',
    'REJECTED',
    'CONVERTED_TO_SALE',
    'PREPARING',
    'READY',
    'DELIVERED',
  ];
  orders: CloudOrderSummary[] = [];
  clients: ClientOption[] = [];
  variantOptions: Record<number, CloudVariant[]> = {};
  puntosCaja: PuntoCaja[] = [];
  selected?: CloudOrderDetail;
  mapUrl?: SafeResourceUrl;
  status?: CloudOrderStatus;
  search = '';
  clientQuery = '';
  cloudPending = false;
  page = 0;
  size = 20;
  total = 0;
  loading = false;
  processing = false;
  cajaAbierta = false;
  clientId?: number;
  puntoCajaId?: number;
  medioPago = 'EFECTIVO';
  tipoDocumento = 'FACTURA_B';
  private clientSearch$ = new Subject<string>();
  constructor(
    private api: CloudOrderService,
    private cajaService: CajaService,
    private toast: ToastrService,
    private sanitizer: DomSanitizer,
  ) {}
  @HostListener('document:keydown.escape')
  closeModal() {
    if (!this.processing) { this.selected = undefined; this.mapUrl = undefined; }
  }
  private setMapUrl(order: CloudOrderDetail) {
    if (order.fulfillmentType !== 'DELIVERY' || order.latitude === null || order.longitude === null || !Number.isFinite(order.latitude) || !Number.isFinite(order.longitude)) { this.mapUrl = undefined; return; }
    const delta = 0.012;
    const bbox = [order.longitude - delta, order.latitude - delta, order.longitude + delta, order.latitude + delta].join('%2C');
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${order.latitude}%2C${order.longitude}`);
  }
  printOrder() {
    const o = this.selected;
    if (!o) return;
    const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    const money = (value: number | null | undefined) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value || 0));
    const delivery = o.fulfillmentType === 'DELIVERY'
      ? `<h2>ENVÍO A DOMICILIO</h2><p>${esc(o.deliveryAddress)}${o.deliveryCity ? `<br>${esc(o.deliveryCity)}` : ''}${o.deliveryZoneName ? `<br>Zona: ${esc(o.deliveryZoneName)}` : ''}${o.deliveryReference ? `<br>Referencia: ${esc(o.deliveryReference)}` : ''}<br>Teléfono: ${esc(o.customerPhone)}</p>`
      : '<h2>RETIRO EN EL LOCAL</h2>';
    const items = o.items.map((i) => `<tr><td>${esc(i.quantity)} × ${esc(i.snapshotName)}${i.resolvedVariantName ? `<br><small>${esc(i.resolvedVariantName)}</small>` : ''}</td><td>${money(i.orderUnitPrice)}</td><td>${money(i.subtotal)}</td></tr>`).join('');
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) { this.toast.error('El navegador bloqueó la ventana de impresión.'); return; }
    win.document.write(`<!doctype html><html><head><title>Pedido ${esc(o.cloudOrderNumber)}</title><style>@page{size:A4;margin:18mm}body{font:14px Arial;color:#1f2937}h1{margin:0;font-size:22px}h2{font-size:13px;border-bottom:1px solid #bbb;padding-bottom:5px;margin-top:22px}p{line-height:1.55}table{width:100%;border-collapse:collapse}th,td{padding:9px 4px;border-bottom:1px solid #ddd;text-align:left}th:last-child,td:last-child{text-align:right}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:15px}</style></head><body><h1>INVENTARIO PIXELS</h1><p>PEDIDO ONLINE<br><b>Pedido:</b> ${esc(o.cloudOrderNumber)}<br><b>Fecha:</b> ${new Date(o.cloudCreatedAt).toLocaleString('es-AR')}</p><h2>CLIENTE</h2><p>${esc(o.customerName)}<br>${esc(o.customerPhone)}${o.customerDocument ? `<br>${esc(o.customerDocument)}` : ''}</p><h2>MODALIDAD</h2>${delivery}<h2>PRODUCTOS</h2><table><thead><tr><th>Descripción</th><th>Unitario</th><th>Subtotal</th></tr></thead><tbody>${items}</tbody></table><h2>TOTALES</h2><p>Subtotal: ${money(o.subtotal)}<br>Costo de envío: ${money(o.shippingCost)}</p><p class="total">TOTAL: ${money(o.total)}</p><script>window.onload=()=>window.print()<\/script></body></html>`);
    win.document.close();
  }
  ngOnInit() {
    this.load();
    this.cargarPuntosCaja();
    this.clientSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) =>
          q.trim().length >= 2
            ? this.api.clients(q.trim())
            : of({
                contenido: [],
                pagina: 0,
                tamanio: 15,
                totalElementos: 0,
                totalPaginas: 0,
              }),
        ),
      )
      .subscribe({
        next: (r) => (this.clients = r.contenido),
        error: (e) => this.fail(e),
      });
  }
  cargarPuntosCaja() {
    this.cajaService.getPuntosActivos().subscribe({
      next: (p) => {
        this.puntosCaja = p;
        const saved = Number(localStorage.getItem('inventario-punto-caja'));
        this.puntoCajaId =
          p.find((x) => x.id === saved)?.id ??
          (p.length === 1 ? p[0].id : undefined);
        this.cambiarPuntoCaja();
      },
      error: () => {
        this.puntosCaja = [];
        this.cajaAbierta = false;
      },
    });
  }
  cambiarPuntoCaja() {
    if (this.puntoCajaId)
      localStorage.setItem('inventario-punto-caja', String(this.puntoCajaId));
    if (!this.puntoCajaId) {
      this.cajaAbierta = false;
      return;
    }
    this.cajaService
      .getCajas(this.puntoCajaId)
      .subscribe({
        next: () => (this.cajaAbierta = true),
        error: () => (this.cajaAbierta = false),
      });
  }
  load() {
    this.loading = true;
    this.api
      .list(
        this.status,
        this.search.trim(),
        this.page,
        this.size,
        this.cloudPending,
      )
      .subscribe({
        next: (r) => {
          this.orders = r.contenido;
          this.total = r.totalElementos;
          this.loading = false;
        },
        error: (e) => this.fail(e),
      });
  }
  open(id: number) {
    this.api.detail(id).subscribe({
      next: (o) => {
        this.selected = o;
        this.setMapUrl(o);
        this.clientId = o.localClientId;
        this.variantOptions = {};
        o.items
          .filter((i) => i.variantSelectionRequired)
          .forEach((i) => this.loadVariants(i.id));
      },
      error: (e) => this.fail(e),
    });
  }
  filter() {
    this.page = 0;
    this.load();
  }
  paging(e: PageEvent) {
    this.page = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }
  searchClients(q: string) {
    this.clientSearch$.next(q);
  }
  loadVariants(itemId: number) {
    if (!this.selected) return;
    this.api
      .variants(this.selected.id, itemId)
      .subscribe({
        next: (v) => (this.variantOptions[itemId] = v),
        error: (e) => this.fail(e),
      });
  }
  assignVariant(itemId: number, variantId: number | null) {
    if (!this.selected) return;
    this.processing = true;
    this.api
      .assignVariant(this.selected.id, itemId, variantId)
      .subscribe({
        next: () => this.done('Variante actualizada.'),
        error: (e) => this.fail(e),
      });
  }
  hasUnresolvedVariants() {
    return !!this.selected?.items.some(
      (i) => i.variantSelectionRequired && !i.resolvedVariantId,
    );
  }
  requiresClient() {
    return this.selected?.paymentMethod === 'CURRENT_ACCOUNT';
  }
  canConvert() {
    return (
      this.selected?.status === 'ACCEPTED' &&
      !this.hasUnresolvedVariants() &&
      this.cajaAbierta &&
      (!this.requiresClient() || !!this.clientId)
    );
  }
  retryResult() {
    if (!this.selected || this.processing) return;
    this.processing = true;
    this.api
      .retryResult(this.selected.id)
      .subscribe({
        next: () => this.done('Reintento Cloud procesado.'),
        error: (e) => this.fail(e),
      });
  }
  cloudLabel(s: string) {
    return (
      (
        {
          SYNCED: 'Sincronizado',
          PENDING: 'Pendiente',
          ERROR: 'Error',
        } as Record<string, string>
      )[s] || s
    );
  }
  accept() {
    if (!this.selected || this.processing || this.hasUnresolvedVariants())
      return;
    this.processing = true;
    this.api
      .accept(this.selected.id)
      .subscribe({
        next: () => this.done('Pedido aceptado.'),
        error: (e) => this.fail(e),
      });
  }
  reject() {
    if (!this.selected || !confirm('¿Rechazar este pedido?')) return;
    const reason = prompt(
      'Motivo: OUT_OF_STOCK, PRODUCT_NOT_AVAILABLE, CUSTOMER_NOT_FOUND, CURRENT_ACCOUNT_REJECTED, INVALID_ORDER u OTHER',
      'OTHER',
    );
    if (!reason) return;
    const message = prompt('Detalle del rechazo', '') || '';
    this.processing = true;
    this.api
      .reject(this.selected.id, reason, message)
      .subscribe({
        next: () => this.done('Pedido rechazado.'),
        error: (e) => this.fail(e),
      });
  }
  link() {
    if (!this.selected || !this.clientId) return;
    this.processing = true;
    this.api
      .linkClient(this.selected.id, this.clientId)
      .subscribe({
        next: () => this.done('Cliente vinculado.'),
        error: (e) => this.fail(e),
      });
  }
  convert() {
    if (
      !this.selected ||
      !this.canConvert() ||
      !confirm(
        '¿Generar la venta? Se descontará stock y se aplicará el medio de pago seleccionado.',
      )
    )
      return;
    this.processing = true;
    this.api
      .convert(this.selected.id, {
        clientId: this.clientId,
        puntoCajaId: this.puntoCajaId,
        medioPago:
          this.selected.paymentMethod === 'CURRENT_ACCOUNT'
            ? 'CUENTA_CORRIENTE'
            : this.medioPago,
        tipoDocumento: this.tipoDocumento,
      })
      .subscribe({
        next: () => this.done('Venta generada correctamente.'),
        error: (e) => this.fail(e),
      });
  }
  canDecide() {
    return (
      !!this.selected &&
      ['PENDING_REVIEW', 'REVIEW_REQUIRED'].includes(this.selected.status)
    );
  }
  logistics(status: 'PREPARING' | 'READY' | 'DELIVERED', message: string) {
    if (!this.selected) return;
    this.processing = true;
    this.api
      .logisticsStatus(this.selected.id, status)
      .subscribe({
        next: () => this.done(message),
        error: (e) => this.fail(e),
      });
  }
  label(s: string) {
    return (
      (
        {
          PENDING_REVIEW: 'Pendiente',
          REVIEW_REQUIRED: 'Requiere revisión',
          ACCEPTED: 'Aceptado',
          REJECTED: 'Rechazado',
          CONVERTED_TO_SALE: 'Venta generada',
          PREPARING: 'Preparando',
          READY: 'Listo para retirar',
          READY_FOR_PICKUP: 'Listo para retirar',
          OUT_FOR_DELIVERY: 'En camino',
          PICKED_UP: 'Retirado',
          DELIVERED: 'Entregado',
        } as Record<string, string>
      )[s] || s
    );
  }
  private done(m: string) {
    this.processing = false;
    this.toast.success(m);
    const id = this.selected?.id;
    this.load();
    if (id) this.open(id);
  }
  private fail(e: any) {
    this.loading = false;
    this.processing = false;
    const code = e?.error?.error;
    this.toast.error(
      code === 'CASH_REGISTER_CLOSED'
        ? 'No hay una caja abierta. Abrí una caja antes de convertir el pedido en venta.'
        : e?.error?.message || 'No se pudo completar la operación.',
    );
  }
}
