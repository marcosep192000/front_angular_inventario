import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { finalize, Observable } from 'rxjs';
import { CloudStore, CommercialSettings, DeliveryZone, DeliveryZoneRequest, MercadoPagoStatus, OrderSchedule } from '../../interfaces/cloud-store';
import { CloudStoreService } from '../../services/cloud-store.service';

const blankCommercial = (): CommercialSettings => ({ description: null, logoUrl: null, bannerUrl: null, primaryColor: null, secondaryColor: null, whatsapp: null, phone: null, address: null, businessHours: null, welcomeMessage: null, pickupInstructions: null, backgroundColor: null, catalogEyebrow: null, catalogTitle: null, catalogSubtitle: null, primaryTextColor: null, secondaryTextColor: null });

@Component({ selector: 'app-cloud-store', standalone: true, imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, MatSlideToggleModule], templateUrl: './cloud-store.component.html', styleUrl: './cloud-store.component.css' })
export class CloudStoreComponent implements OnInit {
  store: CloudStore | null = null; commercial = blankCommercial(); schedule: OrderSchedule = { mode: 'ALWAYS_OPEN', timezone: '', days: [] }; zones: DeliveryZone[] = []; mp: MercadoPagoStatus | null = null;
  loading = true; saving = false; imageLoading: 'logo' | 'banner' | null = null; accessToken = ''; webhookSecret = ''; editingZone: DeliveryZone | null = null; showZoneForm = false;
  zone: DeliveryZoneRequest = this.emptyZone(); readonly dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  constructor(private api: CloudStoreService, private toast: ToastrService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.api.store().subscribe({ next: store => { this.store = store; this.loadDetails(); }, error: error => { this.loading = false; this.fail(error); } }); }
  private loadDetails() { let left = 4; const done = () => { if (--left === 0) this.loading = false; }; this.api.commercial().subscribe({ next: r => this.commercial = r.settings, error: e => { this.fail(e); done(); }, complete: done }); this.api.schedule().subscribe({ next: r => this.schedule = r, error: e => { this.fail(e); done(); }, complete: done }); this.api.zones().subscribe({ next: r => this.zones = r, error: e => { this.fail(e); done(); }, complete: done }); this.api.mercadoPago().subscribe({ next: r => this.mp = r, error: e => { this.fail(e); done(); }, complete: done }); }
  saveName() { if (!this.store?.name.trim()) return; this.busy(this.api.updateName(this.store.name.trim()), r => this.store = r, 'Nombre de tienda guardado.'); }
  saveCommercial() { this.busy(this.api.updateCommercial(this.commercial), r => this.commercial = r.settings, 'Información comercial guardada.'); }
  saveSchedule() { this.busy(this.api.updateSchedule(this.schedule), r => this.schedule = r, 'Horario de pedidos guardado.'); }
  saveMp() { if (!this.mp) return; const body = { enabled: this.mp.enabled, accessToken: this.accessToken || null, webhookSecret: this.webhookSecret || null }; this.busy(this.api.updateMercadoPago(body), r => { this.mp = r; this.accessToken = ''; this.webhookSecret = ''; }, 'Mercado Pago guardado.'); }
  imageSelected(kind: 'logo' | 'banner', event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; (event.target as HTMLInputElement).value = ''; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { this.toast.warning('Elegí una imagen JPEG, PNG o WEBP de hasta 5 MB.'); return; } this.imageLoading = kind; this.api.uploadImage(kind, file).pipe(finalize(() => this.imageLoading = null)).subscribe({ next: () => { this.toast.success(`${kind === 'logo' ? 'Logo' : 'Banner'} actualizado.`); this.api.commercial().subscribe(r => this.commercial = r.settings); }, error: e => this.fail(e) }); }
  removeImage(kind: 'logo' | 'banner') { if (!confirm(`¿Eliminar ${kind === 'logo' ? 'el logo' : 'el banner'} de la tienda?`)) return; this.imageLoading = kind; this.api.deleteImage(kind).pipe(finalize(() => this.imageLoading = null)).subscribe({ next: () => { this.commercial = { ...this.commercial, [kind === 'logo' ? 'logoUrl' : 'bannerUrl']: null }; this.toast.success('Imagen eliminada.'); }, error: e => this.fail(e) }); }
  editZone(zone?: DeliveryZone) { this.editingZone = zone ?? null; this.showZoneForm = true; this.zone = zone ? { name: zone.name, description: zone.description, city: zone.city, shippingCost: zone.shippingCost, minimumOrderAmount: zone.minimumOrderAmount, active: zone.active, sortOrder: zone.sortOrder } : this.emptyZone(); }
  cancelZone() { this.editingZone = null; this.showZoneForm = false; this.zone = this.emptyZone(); }
  saveZone() { if (!this.zone.name.trim() || this.zone.shippingCost == null) return; const body = { ...this.zone, name: this.zone.name.trim(), description: this.zone.description || null, city: this.zone.city || null, shippingCost: Number(this.zone.shippingCost), minimumOrderAmount: this.zone.minimumOrderAmount == null ? null : Number(this.zone.minimumOrderAmount), sortOrder: Number(this.zone.sortOrder) }; const request = this.editingZone ? this.api.updateZone(this.editingZone.id, body) : this.api.createZone(body); this.busy(request, () => { this.cancelZone(); this.api.zones().subscribe(r => this.zones = r); }, 'Zona de delivery guardada.'); }
  deleteZone(zone: DeliveryZone) { if (!confirm(`¿Eliminar la zona “${zone.name}”?`)) return; this.busy(this.api.deleteZone(zone.id), () => this.zones = this.zones.filter(x => x.id !== zone.id), 'Zona eliminada.'); }
  openStore() { if (this.store?.slug) window.open(`https://pixelsinventario.tech/store/${this.store.slug}`, '_blank', 'noopener,noreferrer'); }
  private emptyZone(): DeliveryZoneRequest { return { name: '', description: null, city: null, shippingCost: 0, minimumOrderAmount: null, active: true, sortOrder: this.zones.length }; }
  private busy<T>(request: Observable<T>, next: (value: T) => void, message: string) { if (this.saving) return; this.saving = true; request.pipe(finalize(() => this.saving = false)).subscribe({ next: (r: T) => { next(r); this.toast.success(message); }, error: (e: unknown) => this.fail(e) }); }
  fail(error: any) { const code = error?.error?.error; const messages: Record<string, string> = { CLOUD_DISABLED: 'Cloud no está habilitado para esta empresa.', INSTALLATION_NOT_ACTIVATED: 'La instalación Cloud todavía no está activada.', CLOUD_UNAVAILABLE: 'Cloud no está disponible en este momento.', CLOUD_AUTHORIZATION_FAILED: 'No se pudo autorizar la conexión con Cloud.', STORE_SELECTION_REQUIRED: 'La empresa tiene más de una tienda configurada. Contactá al administrador de Pixels.', CLOUD_REQUEST_REJECTED: 'Cloud rechazó la solicitud. Revisá los datos e intentá nuevamente.', INVALID_STORE_IMAGE: 'La imagen no es válida. Usá JPEG, PNG o WEBP de hasta 5 MB.' }; this.toast.error(messages[code] || error?.error?.message || 'No se pudo completar la operación.'); }
}
