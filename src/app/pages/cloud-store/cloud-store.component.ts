import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { finalize, Observable } from 'rxjs';
import {
  CloudStore,
  CommercialSettings,
  DeliveryZone,
  DeliveryZoneRequest,
  MercadoPagoStatus,
  OrderSchedule,
} from '../../interfaces/cloud-store';
import { CloudStoreService } from '../../services/cloud-store.service';

type ImageKind = 'logo' | 'banner' | 'page' | 'catalog';

const blankCommercial = (): CommercialSettings => ({
  description: null,
  logoUrl: null,
  bannerUrl: null,
  bannerBackgroundColor: null,
  primaryColor: null,
  secondaryColor: null,
  whatsapp: null,
  phone: null,
  address: null,
  businessHours: null,
  welcomeMessage: null,
  pickupInstructions: null,
  backgroundColor: null,
  catalogEyebrow: null,
  catalogTitle: null,
  catalogSubtitle: null,
  primaryTextColor: null,
  secondaryTextColor: null,
  catalogBackgroundSize: null,
  catalogBackgroundPosition: null,
  catalogBackgroundOverlay: null,
  pageBackgroundSize: null,
  pageBackgroundPosition: null,
  pageBackgroundOverlay: null,
  bodyFontFamily: null,
  headingFontFamily: null,
  logoOpacity: null, bannerOpacity: null, pageBackgroundOpacity: null, catalogBackgroundOpacity: null,
});

@Component({
  selector: 'app-cloud-store',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './cloud-store.component.html',
  styleUrl: './cloud-store.component.css',
})
export class CloudStoreComponent implements OnInit, OnDestroy {
  store: CloudStore | null = null;
  commercial = blankCommercial();
  schedule: OrderSchedule = { mode: 'ALWAYS_OPEN', timezone: '', days: [] };
  zones: DeliveryZone[] = [];
  mp: MercadoPagoStatus | null = null;
  loading = true;
  saving = false;
  imageLoading: ImageKind | null = null;
  private temporaryPreviews: Partial<Record<ImageKind, string>> = {};
  private pendingFiles: Partial<Record<ImageKind, File>> = {};
  private failedImages = new Set<ImageKind>();
  accessToken = '';
  webhookSecret = '';
  editingZone: DeliveryZone | null = null;
  showZoneForm = false;
  zone: DeliveryZoneRequest = this.emptyZone();
  readonly dayNames = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  readonly sizes = [
    ['COVER', 'Cubrir'],
    ['CONTAIN', 'Contener'],
    ['REPEAT', 'Repetir'],
  ] as const;
  readonly positions = [
    ['CENTER', 'Centro'],
    ['TOP', 'Arriba'],
    ['BOTTOM', 'Abajo'],
  ] as const;
  readonly fonts = [
    ['INTER', 'Inter'],
    ['ROBOTO', 'Roboto'],
    ['OPEN_SANS', 'Open Sans'],
    ['LATO', 'Lato'],
    ['MONTSERRAT', 'Montserrat'],
    ['POPPINS', 'Poppins'],
    ['NUNITO', 'Nunito'],
    ['RALEWAY', 'Raleway'],
    ['MERRIWEATHER', 'Merriweather'],
    ['PLAYFAIR_DISPLAY', 'Playfair Display'],
  ] as const;
  fontFamily(font: string | null) {
    const families: Record<string, string> = {
      INTER: 'Inter, sans-serif',
      ROBOTO: 'Roboto, sans-serif',
      OPEN_SANS: 'Open Sans, sans-serif',
      LATO: 'Lato, sans-serif',
      MONTSERRAT: 'Montserrat, sans-serif',
      POPPINS: 'Poppins, sans-serif',
      NUNITO: 'Nunito, sans-serif',
      RALEWAY: 'Raleway, sans-serif',
      MERRIWEATHER: 'Merriweather, serif',
      PLAYFAIR_DISPLAY: 'Playfair Display, serif',
    };
    return font ? families[font] || 'inherit' : 'inherit';
  }
  transparency(opacity: number | null) { return 100 - (opacity ?? 100); }
  effectiveOpacity(opacity: number | null) { return (opacity ?? 100) / 100; }
  effectiveBannerBackgroundColor() {
    const color = this.commercial.bannerBackgroundColor;
    return color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#193E4B';
  }
  setBannerBackgroundColor(color: string) {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) this.commercial.bannerBackgroundColor = color;
  }
  setTransparency(field: 'logoOpacity' | 'bannerOpacity' | 'pageBackgroundOpacity' | 'catalogBackgroundOpacity', value: number) {
    this.commercial[field] = 100 - Number(value);
  }
  constructor(
    private api: CloudStoreService,
    private toast: ToastrService,
  ) {}
  ngOnInit() {
    this.load();
  }
  ngOnDestroy() { Object.values(this.temporaryPreviews).forEach((url) => url && URL.revokeObjectURL(url)); }
  imageUrl(kind: ImageKind) {
    if (this.temporaryPreviews[kind]) return this.temporaryPreviews[kind]!;
    if (this.failedImages.has(kind)) return null;
    if (kind === 'logo') return this.resolveCloudImageUrl(this.commercial.logoUrl);
    if (kind === 'banner') return this.resolveCloudImageUrl(this.commercial.bannerUrl);
    return this.resolveCloudImageUrl(kind === 'page' ? this.store?.pageBackgroundImageUrl : this.store?.catalogBackgroundImageUrl);
  }
  private resolveCloudImageUrl(url: string | null | undefined) {
    if (!url || /^(https?:|blob:|data:)/i.test(url)) return url || null;
    return `https://pixelsinventario.tech${url.startsWith('/') ? '' : '/'}${url}`;
  }
  persistentImageUrl(kind: ImageKind) {
    if (kind === 'logo') return this.resolveCloudImageUrl(this.commercial.logoUrl);
    if (kind === 'banner') return this.resolveCloudImageUrl(this.commercial.bannerUrl);
    return this.resolveCloudImageUrl(kind === 'page' ? this.store?.pageBackgroundImageUrl : this.store?.catalogBackgroundImageUrl);
  }
  hasPendingImage(kind: ImageKind) { return !!this.pendingFiles[kind]; }
  hasPersistentImage(kind: ImageKind) { return !!this.persistentImageUrl(kind); }
  imageFailed(kind: ImageKind) { this.failedImages.add(kind); }
  private setTemporaryPreview(kind: ImageKind, file: File) {
    this.failedImages.delete(kind);
    this.clearTemporaryPreview(kind);
    this.temporaryPreviews[kind] = URL.createObjectURL(file);
  }
  private clearTemporaryPreview(kind: ImageKind) {
    const url = this.temporaryPreviews[kind];
    if (url) URL.revokeObjectURL(url);
    delete this.temporaryPreviews[kind];
  }
  cancelPendingImage(kind: ImageKind) {
    this.clearTemporaryPreview(kind);
    delete this.pendingFiles[kind];
  }
  load() {
    this.loading = true;
    this.api.store().subscribe({
      next: (store) => {
        // Store responses can omit image URLs. An omitted field must not erase a
        // preview; an explicit null still represents a deleted image.
        this.store = { ...this.store, ...store } as CloudStore;
        this.loadDetails();
      },
      error: (error) => {
        this.loading = false;
        this.fail(error);
      },
    });
  }
  private loadDetails() {
    let left = 4;
    const done = () => {
      if (--left === 0) this.loading = false;
    };
    this.api.commercial().subscribe({
      next: (r) => this.mergeCommercial(r.settings),
      error: (e) => {
        this.fail(e);
        done();
      },
      complete: done,
    });
    this.api.schedule().subscribe({
      next: (r) => (this.schedule = r),
      error: (e) => {
        this.fail(e);
        done();
      },
      complete: done,
    });
    this.api.zones().subscribe({
      next: (r) => (this.zones = r),
      error: (e) => {
        this.fail(e);
        done();
      },
      complete: done,
    });
    this.api.mercadoPago().subscribe({
      next: (r) => (this.mp = r),
      error: (e) => {
        this.fail(e);
        done();
      },
      complete: done,
    });
  }
  saveName() {
    if (!this.store?.name.trim()) return;
    this.busy(
      this.api.updateName(this.store.name.trim()),
      (r) => (this.store = r),
      'Nombre de tienda guardado.',
    );
  }
  saveCommercial() {
    this.busy(
      this.api.updateCommercial(this.commercial),
      (r) => this.mergeCommercial(r.settings),
      'Información comercial guardada.',
    );
  }
  saveSchedule() {
    this.busy(
      this.api.updateSchedule(this.schedule),
      (r) => (this.schedule = r),
      'Horario de pedidos guardado.',
    );
  }
  saveMp() {
    if (!this.mp) return;
    const body = {
      enabled: this.mp.enabled,
      accessToken: this.accessToken || null,
      webhookSecret: this.webhookSecret || null,
    };
    this.busy(
      this.api.updateMercadoPago(body),
      (r) => {
        this.mp = r;
        this.accessToken = '';
        this.webhookSecret = '';
      },
      'Mercado Pago guardado.',
    );
  }
  backgroundSelected(page: boolean, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (
      !file ||
      file.size === 0 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.toast.warning('Elegí una imagen JPEG, PNG o WEBP de hasta 5 MB.');
      return;
    }
    this.selectPendingImage(page ? 'page' : 'catalog', file);
  }
  deleteBackground(page: boolean) {
    if (!confirm('¿Eliminar este fondo?')) return;
    this.busy(
      page ? this.api.deletePageBackground() : this.api.deleteBackground(),
      () => this.load(),
      'Fondo eliminado.',
    );
  }
  imageSelected(kind: 'logo' | 'banner', event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.toast.warning('Elegí una imagen JPEG, PNG o WEBP de hasta 5 MB.');
      return;
    }
    this.selectPendingImage(kind, file);
  }
  private selectPendingImage(kind: ImageKind, file: File) {
    this.setTemporaryPreview(kind, file);
    this.pendingFiles[kind] = file;
  }
  savePendingImage(kind: ImageKind) {
    const file = this.pendingFiles[kind];
    if (!file || this.imageLoading) return;
    this.imageLoading = kind;
    const upload = kind === 'logo' || kind === 'banner'
      ? this.api.uploadImage(kind, file)
      : kind === 'page'
        ? this.api.uploadPageBackground(file)
        : this.api.uploadBackground(file);
    upload.pipe(finalize(() => (this.imageLoading = null))).subscribe({
      next: () => this.refreshPersistedImage(kind),
      // Keep both file and blob preview: the user can retry without selecting again.
      error: (e) => this.fail(e),
    });
  }
  private refreshPersistedImage(kind: ImageKind) {
    const complete = () => {
      // The persisted URL is available before the object URL is released.
      if (!this.hasPersistentImage(kind)) {
        this.toast.error('La imagen se subió, pero no se pudo obtener su URL. Podés reintentar sin perder el preview.');
        return;
      }
      this.cancelPendingImage(kind);
      this.toast.success('Imagen actualizada.');
    };
    if (kind === 'logo' || kind === 'banner') {
      this.api.commercial().subscribe({
        next: (value) => { this.mergeCommercial(value.settings); complete(); },
        error: (e) => this.fail(e),
      });
      return;
    }
    this.api.store().subscribe({
      next: (value) => { this.store = { ...this.store, ...value } as CloudStore; complete(); },
      // Upload succeeded, but retain the local preview until a valid persisted URL can be read.
      error: (e) => this.fail(e),
    });
  }
  removeImage(kind: 'logo' | 'banner') {
    if (
      !confirm(
        `¿Eliminar ${kind === 'logo' ? 'el logo' : 'el banner'} de la tienda?`,
      )
    )
      return;
    this.imageLoading = kind;
    this.api
      .deleteImage(kind)
      .pipe(finalize(() => (this.imageLoading = null)))
      .subscribe({
        next: () => {
          this.commercial = {
            ...this.commercial,
            [kind === 'logo' ? 'logoUrl' : 'bannerUrl']: null,
          };
          this.toast.success('Imagen eliminada.');
        },
        error: (e) => this.fail(e),
      });
  }
  editZone(zone?: DeliveryZone) {
    this.editingZone = zone ?? null;
    this.showZoneForm = true;
    this.zone = zone
      ? {
          name: zone.name,
          description: zone.description,
          city: zone.city,
          shippingCost: zone.shippingCost,
          minimumOrderAmount: zone.minimumOrderAmount,
          active: zone.active,
          sortOrder: zone.sortOrder,
        }
      : this.emptyZone();
  }
  cancelZone() {
    this.editingZone = null;
    this.showZoneForm = false;
    this.zone = this.emptyZone();
  }
  saveZone() {
    if (!this.zone.name.trim() || this.zone.shippingCost == null) return;
    const body = {
      ...this.zone,
      name: this.zone.name.trim(),
      description: this.zone.description || null,
      city: this.zone.city || null,
      shippingCost: Number(this.zone.shippingCost),
      minimumOrderAmount:
        this.zone.minimumOrderAmount == null
          ? null
          : Number(this.zone.minimumOrderAmount),
      sortOrder: Number(this.zone.sortOrder),
    };
    const request = this.editingZone
      ? this.api.updateZone(this.editingZone.id, body)
      : this.api.createZone(body);
    this.busy(
      request,
      () => {
        this.cancelZone();
        this.api.zones().subscribe((r) => (this.zones = r));
      },
      'Zona de delivery guardada.',
    );
  }
  deleteZone(zone: DeliveryZone) {
    if (!confirm(`¿Eliminar la zona “${zone.name}”?`)) return;
    this.busy(
      this.api.deleteZone(zone.id),
      () => (this.zones = this.zones.filter((x) => x.id !== zone.id)),
      'Zona eliminada.',
    );
  }
  openStore() {
    if (this.store?.slug)
      window.open(
        `https://pixelsinventario.tech/store/${this.store.slug}`,
        '_blank',
        'noopener,noreferrer',
      );
  }
  private emptyZone(): DeliveryZoneRequest {
    return {
      name: '',
      description: null,
      city: null,
      shippingCost: 0,
      minimumOrderAmount: null,
      active: true,
      sortOrder: this.zones.length,
    };
  }
  private mergeCommercial(settings: CommercialSettings) {
    // Commercial PUT/GET responses may be partial. Keep the independent image
    // URL state unless the server explicitly includes a replacement or null.
    this.commercial = { ...this.commercial, ...settings };
  }
  private busy<T>(
    request: Observable<T>,
    next: (value: T) => void,
    message: string,
  ) {
    if (this.saving) return;
    this.saving = true;
    request.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (r: T) => {
        next(r);
        this.toast.success(message);
      },
      error: (e: unknown) => this.fail(e),
    });
  }
  fail(error: any) {
    const code = error?.error?.error;
    const messages: Record<string, string> = {
      CLOUD_DISABLED: 'Cloud no está habilitado para esta empresa.',
      INSTALLATION_NOT_ACTIVATED:
        'La instalación Cloud todavía no está activada.',
      CLOUD_UNAVAILABLE: 'Cloud no está disponible en este momento.',
      CLOUD_AUTHORIZATION_FAILED: 'No se pudo autorizar la conexión con Cloud.',
      STORE_SELECTION_REQUIRED:
        'La empresa tiene más de una tienda configurada. Contactá al administrador de Pixels.',
      CLOUD_REQUEST_REJECTED:
        'Cloud rechazó la solicitud. Revisá los datos e intentá nuevamente.',
      INVALID_STORE_IMAGE:
        'La imagen no es válida. Usá JPEG, PNG o WEBP de hasta 5 MB.',
    };
    this.toast.error(
      messages[code] ||
        error?.error?.message ||
        'No se pudo completar la operación.',
    );
  }
}
