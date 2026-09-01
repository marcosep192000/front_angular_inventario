import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyDocumentConfig } from '../../config/company-document.config';
import { Empresa } from '../../interfaces/administracion';
import { PurchaseOrder, PurchaseOrderStatus } from '../../interfaces/purchase-order';
import { Supplier } from '../../interfaces/supplier';
import { AdministracionService } from '../../services/administracion.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { SupplierService } from '../../services/supplier.service';
import { PoSumPipe } from './po-sum.pipe';
import { PurchaseOrderReceiveDialogComponent } from './purchase-order-receive-dialog.component';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatDialogModule, MatIconModule, PoSumPipe],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-orders.css',
  styles: [`.whatsapp-order{border-color:#20a95a!important;color:#147a3b!important}.whatsapp-order:hover:not(:disabled){color:#fff!important;background:#20a95a!important}.whatsapp-warning{display:flex;align-items:center;gap:7px;margin:0 0 14px;color:#806f48;font-size:12px}.whatsapp-warning mat-icon{width:18px;height:18px;font-size:18px}`],
})
export class PurchaseOrderDetailComponent implements OnInit {
  order: PurchaseOrder | null = null;
  supplier: Supplier | null = null;
  company: Partial<Empresa> = {};
  loading = true;
  processing = false;
  generatingPdf = false;
  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: PurchaseOrderService,
    private readonly supplierApi: SupplierService,
    private readonly adminApi: AdministracionService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.adminApi.obtenerEmpresa().subscribe({ next: company => this.company = company });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getPurchaseOrderById(this.id).subscribe({
      next: order => {
        this.order = order;
        this.loading = false;
        this.supplierApi.findById(order.provider.id).subscribe({ next: supplier => this.supplier = supplier });
      },
      error: error => { this.loading = false; this.showError(error); },
    });
  }

  edit(): void { this.router.navigate(['/dashboard/purchase-orders', this.id, 'edit']); }
  send(): void { if (!confirm('¿Marcar el pedido como enviado?')) return; this.processing = true; this.api.sendPurchaseOrder(this.id).subscribe({ next: () => { this.processing = false; this.toastr.success('Pedido enviado.'); this.load(); }, error: error => { this.processing = false; this.showError(error); this.load(); } }); }
  receive(): void { this.dialog.open(PurchaseOrderReceiveDialogComponent, { width: '850px', maxWidth: '95vw', data: { orderId: this.id } }).afterClosed().subscribe(ok => { if (ok) this.load(); }); }
  cancel(): void { const observation = prompt('Motivo de cancelación (opcional):'); if (observation === null) return; this.processing = true; this.api.cancelPurchaseOrder(this.id, { observation }).subscribe({ next: () => { this.processing = false; this.toastr.success('Pedido cancelado.'); this.load(); }, error: error => { this.processing = false; this.showError(error); this.load(); } }); }

  canEdit(status: PurchaseOrderStatus): boolean { return status === 'DRAFT'; }
  canSend(status: PurchaseOrderStatus): boolean { return status === 'DRAFT' || status === 'PENDING_APPROVAL'; }
  canReceive(status: PurchaseOrderStatus): boolean { return status === 'SENT' || status === 'PARTIALLY_RECEIVED'; }
  canCancel(status: PurchaseOrderStatus): boolean { return !['RECEIVED', 'CANCELLED'].includes(status); }
  label(status: PurchaseOrderStatus): string { return ({ DRAFT: 'Borrador', PENDING_APPROVAL: 'Pendiente de aprobación', SENT: 'Enviado', PARTIALLY_RECEIVED: 'Recepción parcial', RECEIVED: 'Recibido', CANCELLED: 'Cancelado' } as Record<PurchaseOrderStatus, string>)[status]; }

  get whatsappAvailable(): boolean { return this.phoneDigits.length >= 8; }

  sendWhatsapp(): void {
    if (!this.order || !this.whatsappAvailable) {
      this.toastr.warning('El proveedor no tiene un teléfono válido cargado.');
      return;
    }
    const lines = this.order.details.map(detail => `• ${detail.productName}: ${detail.requestedQuantity} u. — ${this.money(detail.subtotal)}`);
    const message = [
      `Hola ${this.order.provider.name}, enviamos el pedido de compra ${this.order.orderNumber}.`,
      '', ...lines, '',
      `Total estimado: ${this.money(this.order.estimatedTotal)}`,
      this.order.observation ? `Observación: ${this.order.observation}` : '',
      '', this.companyName,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${this.normalizedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  async downloadPdf(): Promise<void> {
    if (!this.order || this.generatingPdf) return;
    this.generatingPdf = true;
    try {
      const order = this.order;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      doc.setFillColor(64, 46, 114); doc.rect(0, 0, width, 40, 'F');
      const logo = await this.getLogo();
      if (logo) doc.addImage(logo, 'PNG', 14, 8, 24, 24);
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text(this.companyName, logo ? 43 : 14, 17);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(`CUIT ${this.company.cuit || CompanyDocumentConfig.cuit}`, logo ? 43 : 14, 24); doc.text(this.companyContact || 'Sistema de gestión comercial', logo ? 43 : 14, 29);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text('PEDIDO DE COMPRA', width - 14, 16, { align: 'right' }); doc.setFontSize(9); doc.text(order.orderNumber, width - 14, 24, { align: 'right' }); doc.text(new Date(order.createdAt).toLocaleDateString('es-AR'), width - 14, 30, { align: 'right' });
      doc.setTextColor(42, 45, 54); doc.setFontSize(10); doc.text(`Proveedor: ${order.provider.name}`, 14, 51); doc.text(`CUIT: ${order.provider.cuit || '-'}`, 14, 58); doc.text(`Estado: ${this.label(order.status)}`, 120, 51); doc.text(`Observación: ${order.observation || 'Sin observaciones'}`, 14, 66);
      autoTable(doc, { startY: 75, head: [['Producto', 'Código', 'Cantidad', 'Costo estimado', 'Subtotal']], body: order.details.map(detail => [detail.productName, detail.barCode || detail.code || '-', String(detail.requestedQuantity), this.money(detail.estimatedUnitCost), this.money(detail.subtotal)]), theme: 'striped', margin: { left: 14, right: 14 }, headStyles: { fillColor: [64, 46, 114] }, columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } } });
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(`TOTAL ESTIMADO: ${this.money(order.estimatedTotal)}`, width - 14, Math.min(finalY, height - 25), { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.text('Documento interno. Los costos definitivos son calculados por el sistema.', 14, height - 10);
      doc.save(`pedido-compra-${order.orderNumber}.pdf`);
    } catch {
      this.toastr.error('No se pudo generar el PDF del pedido.');
    } finally {
      this.generatingPdf = false;
    }
  }

  private get companyName(): string { return this.company.nombreFantasia || this.company.name || CompanyDocumentConfig.tradeName; }
  private get companyContact(): string { return [this.company.address, this.company.phone, this.company.email].filter(Boolean).join(' · '); }
  private get phoneDigits(): string { return String(this.supplier?.phone || '').replace(/\D/g, ''); }
  private get normalizedPhone(): string { let phone = this.phoneDigits; if (phone.startsWith('00')) phone = phone.slice(2); if (phone.startsWith('0')) phone = phone.slice(1); if (!phone.startsWith('54')) phone = `549${phone}`; else if (!phone.startsWith('549')) phone = `549${phone.slice(2)}`; return phone; }
  private money(value: number): string { return `$ ${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
  private getLogo(): Promise<string | null> { return firstValueFrom(this.adminApi.obtenerLogo()).then(blob => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(String(reader.result)); reader.onerror = () => reject(); reader.readAsDataURL(blob); })).catch(() => null); }
  private showError(error: unknown): void { const response = error as { error?: { message?: string } }; this.toastr.error(response.error?.message || 'No se pudo completar la operación.'); }
}
