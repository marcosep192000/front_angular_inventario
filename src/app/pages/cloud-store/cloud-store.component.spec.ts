import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CloudStoreComponent } from './cloud-store.component';
import { CloudStoreService } from '../../services/cloud-store.service';
import { ToastrService } from 'ngx-toastr';

describe('CloudStoreComponent', () => {
  const settings = {
    description: null, logoUrl: null, bannerUrl: null, bannerBackgroundColor: null, primaryColor: '#111111', secondaryColor: '#ffffff',
    whatsapp: null, phone: null, address: null, businessHours: null, welcomeMessage: null, pickupInstructions: null,
    backgroundColor: '#eeeeee', catalogEyebrow: null, catalogTitle: null, catalogSubtitle: null,
    primaryTextColor: null, secondaryTextColor: null, catalogBackgroundSize: 'COVER' as const,
    catalogBackgroundPosition: 'BOTTOM' as const, catalogBackgroundOverlay: 80,
    pageBackgroundSize: 'REPEAT' as const, pageBackgroundPosition: 'TOP' as const, pageBackgroundOverlay: 0,
    bodyFontFamily: null, headingFontFamily: 'MONTSERRAT' as const,
  };
  let api: any;
  let toast: any;
  let component: CloudStoreComponent;

  beforeEach(() => {
    api = jasmine.createSpyObj('CloudStoreService', [
      'store', 'commercial', 'schedule', 'zones', 'mercadoPago', 'updateCommercial',
      'uploadImage', 'uploadBackground', 'uploadPageBackground', 'deleteBackground', 'deletePageBackground',
    ]);
    toast = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    api.store.and.returnValue(of({ id: 1, companyId: 1, name: 'Tienda', slug: null, status: 'ACTIVE', currency: 'ARS', createdAt: '', updatedAt: '', catalogBackgroundImageUrl: null, pageBackgroundImageUrl: null }));
    api.commercial.and.returnValue(of({ storeId: 1, companyId: 1, settings }));
    api.schedule.and.returnValue(of({ mode: 'ALWAYS_OPEN', timezone: 'America/Argentina/Buenos_Aires', days: [] }));
    api.zones.and.returnValue(of([]));
    api.mercadoPago.and.returnValue(of({ enabled: false, configured: false }));
    component = new CloudStoreComponent(api, toast);
  });

  it('hidrata los campos de apariencia, incluidos fondos, overlays y fuentes', () => {
    component.load();
    expect(component.commercial.pageBackgroundOverlay).toBe(0);
    expect(component.commercial.catalogBackgroundOverlay).toBe(80);
    expect(component.commercial.pageBackgroundSize).toBe('REPEAT');
    expect(component.commercial.catalogBackgroundPosition).toBe('BOTTOM');
    expect(component.commercial.bodyFontFamily).toBeNull();
    expect(component.commercial.headingFontFamily).toBe('MONTSERRAT');
  });

  it('mantiene previews nulos cuando Cloud no devuelve imágenes', () => {
    component.load();
    expect(component.store?.pageBackgroundImageUrl).toBeNull();
    expect(component.store?.catalogBackgroundImageUrl).toBeNull();
  });

  it('mantiene el fondo general pendiente hasta confirmar su guardado', () => {
    api.uploadPageBackground.and.returnValue(of(void 0));
    const file = new File(['image'], 'page.png', { type: 'image/png' });
    component.backgroundSelected(true, { target: { files: [file], value: '' } } as any);
    expect(component.hasPendingImage('page')).toBeTrue();
    expect(api.uploadPageBackground).not.toHaveBeenCalled();
    component.savePendingImage('page');
    expect(api.uploadPageBackground).toHaveBeenCalledWith(file);
  });

  it('mantiene el fondo del catálogo pendiente hasta confirmar su guardado', () => {
    api.uploadBackground.and.returnValue(of(void 0));
    const file = new File(['image'], 'catalog.webp', { type: 'image/webp' });
    component.backgroundSelected(false, { target: { files: [file], value: '' } } as any);
    expect(component.hasPendingImage('catalog')).toBeTrue();
    expect(api.uploadBackground).not.toHaveBeenCalled();
    component.savePendingImage('catalog');
    expect(api.uploadBackground).toHaveBeenCalledWith(file);
  });

  it('elimina el fondo general y el del catálogo tras confirmar', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    api.deletePageBackground.and.returnValue(of(void 0));
    api.deleteBackground.and.returnValue(of(void 0));
    component.deleteBackground(true);
    component.deleteBackground(false);
    expect(api.deletePageBackground).toHaveBeenCalled();
    expect(api.deleteBackground).toHaveBeenCalled();
  });

  it('rechaza MIME inválido, archivo vacío y archivo mayor a 5 MB', () => {
    const invalid = new File(['x'], 'file.gif', { type: 'image/gif' });
    const empty = new File([], 'empty.png', { type: 'image/png' });
    const large = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' });
    [invalid, empty, large].forEach((file) => component.backgroundSelected(false, { target: { files: [file], value: '' } } as any));
    expect(api.uploadBackground).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledTimes(3);
  });

  it('persiste la apariencia sin transformar null de fuente ni los límites de overlay', () => {
    component.commercial = { ...settings, bannerBackgroundColor: '#193E4B', pageBackgroundOverlay: 0, catalogBackgroundOverlay: 80, bodyFontFamily: null, logoOpacity: null, bannerOpacity: null, pageBackgroundOpacity: null, catalogBackgroundOpacity: null };
    api.updateCommercial.and.returnValue(of({ storeId: 1, companyId: 1, settings: component.commercial }));
    component.saveCommercial();
    expect(api.updateCommercial).toHaveBeenCalledWith(jasmine.objectContaining({ bannerBackgroundColor: '#193E4B', pageBackgroundOverlay: 0, catalogBackgroundOverlay: 80, bodyFontFamily: null }));
  });

  it('usa el color de banner por defecto y lo cambia sin HTTP ni afectar imagen u opacidad', () => {
    component.commercial = { ...settings, bannerBackgroundColor: null, logoOpacity: null, bannerOpacity: 55, pageBackgroundOpacity: null, catalogBackgroundOpacity: null };
    expect(component.effectiveBannerBackgroundColor()).toBe('#193E4B');
    const bannerUrl = component.commercial.bannerUrl;
    component.setBannerBackgroundColor('#FF9966');
    expect(component.effectiveBannerBackgroundColor()).toBe('#FF9966');
    expect(component.commercial.bannerUrl).toBe(bannerUrl);
    expect(component.commercial.bannerOpacity).toBe(55);
    expect(api.updateCommercial).not.toHaveBeenCalled();
    expect(api.uploadImage).not.toHaveBeenCalled();
  });

  it('conserva las URLs y aplica la opacidad correcta al mover transparencia, sin HTTP', () => {
    component.commercial = {
      ...settings, logoUrl: '/api/v1/public/stores/test/logo?v=123', bannerUrl: '/api/v1/public/stores/test/banner?v=123',
      logoOpacity: 100, bannerOpacity: 100, pageBackgroundOpacity: 100, catalogBackgroundOpacity: 100,
    };
    component.store = {
      id: 1, companyId: 1, name: 'Tienda', slug: null, status: 'ACTIVE', currency: 'ARS', createdAt: '', updatedAt: '',
      pageBackgroundImageUrl: '/api/v1/public/stores/test/page?v=123', catalogBackgroundImageUrl: '/api/v1/public/stores/test/catalog?v=123',
    };
    const urls = [component.commercial.logoUrl, component.commercial.bannerUrl, component.store.pageBackgroundImageUrl, component.store.catalogBackgroundImageUrl];
    component.setTransparency('logoOpacity', 45);
    component.setTransparency('bannerOpacity', 45);
    component.setTransparency('pageBackgroundOpacity', 45);
    component.setTransparency('catalogBackgroundOpacity', 45);
    expect(component.commercial.logoOpacity).toBe(55);
    expect(component.commercial.bannerOpacity).toBe(55);
    expect(component.commercial.pageBackgroundOpacity).toBe(55);
    expect(component.commercial.catalogBackgroundOpacity).toBe(55);
    expect(component.effectiveOpacity(component.commercial.logoOpacity)).toBe(0.55);
    expect(component.imageUrl('logo')).toContain(urls[0]!);
    expect(component.imageUrl('banner')).toContain(urls[1]!);
    expect(component.imageUrl('page')).toContain(urls[2]!);
    expect(component.imageUrl('catalog')).toContain(urls[3]!);
    expect(api.updateCommercial).not.toHaveBeenCalled();
  });

  it('renderiza Mercado Pago como la última sección principal', async () => {
    await TestBed.configureTestingModule({
      imports: [CloudStoreComponent, NoopAnimationsModule],
      providers: [{ provide: CloudStoreService, useValue: api }, { provide: ToastrService, useValue: toast }],
    }).compileComponents();
    const fixture: ComponentFixture<CloudStoreComponent> = TestBed.createComponent(CloudStoreComponent);
    fixture.detectChanges();
    const titles = Array.from(fixture.nativeElement.querySelectorAll('.panel > .section-title h2') as NodeListOf<Element>)
      .map((title) => title.textContent?.trim());
    expect(titles.indexOf('Mercado Pago')).toBe(titles.length - 1);
    expect(titles.indexOf('Apariencia')).toBeLessThan(titles.indexOf('General'));
    expect(titles.indexOf('General')).toBeLessThan(titles.indexOf('Contacto'));
    expect(titles.indexOf('Contacto')).toBeLessThan(titles.indexOf('Pedidos y delivery'));
  });

  it('no sube logo ni banner al seleccionar, conserva el blob al cambiar transparencia y permite cancelar', () => {
    spyOn(URL, 'createObjectURL').and.returnValues('blob:logo', 'blob:banner');
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' });
    const banner = new File(['banner'], 'banner.png', { type: 'image/png' });
    component.imageSelected('logo', { target: { files: [logo], value: '' } } as any);
    component.imageSelected('banner', { target: { files: [banner], value: '' } } as any);
    expect(component.imageUrl('logo')).toBe('blob:logo');
    expect(component.imageUrl('banner')).toBe('blob:banner');
    expect(api.uploadImage).not.toHaveBeenCalled();
    component.setTransparency('logoOpacity', 45);
    expect(component.imageUrl('logo')).toBe('blob:logo');
    component.cancelPendingImage('logo');
    expect(api.uploadImage).not.toHaveBeenCalled();
    expect(component.hasPendingImage('logo')).toBeFalse();
  });

  it('conserva el preview temporal si falla el upload', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:retry');
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    api.uploadImage.and.returnValue(throwError(() => ({ error: {} })));
    component.imageSelected('logo', { target: { files: [file], value: '' } } as any);
    component.savePendingImage('logo');
    expect(component.hasPendingImage('logo')).toBeTrue();
    expect(component.imageUrl('logo')).toBe('blob:retry');
  });

  it('muestra error ante un fallo HTTP al cargar', () => {
    api.store.and.returnValue(throwError(() => ({ error: { code: 'CLOUD_UNAVAILABLE' } })));
    component.load();
    expect(toast.error).toHaveBeenCalled();
  });
});
