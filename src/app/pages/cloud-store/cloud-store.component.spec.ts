import { of, throwError } from 'rxjs';
import { CloudStoreComponent } from './cloud-store.component';

describe('CloudStoreComponent', () => {
  const settings = {
    description: null, logoUrl: null, bannerUrl: null, primaryColor: '#111111', secondaryColor: '#ffffff',
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
      'uploadBackground', 'uploadPageBackground', 'deleteBackground', 'deletePageBackground',
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

  it('sube y luego recarga el fondo general', () => {
    api.uploadPageBackground.and.returnValue(of(void 0));
    const file = new File(['image'], 'page.png', { type: 'image/png' });
    component.backgroundSelected(true, { target: { files: [file], value: '' } } as any);
    expect(api.uploadPageBackground).toHaveBeenCalledWith(file);
    expect(api.store).toHaveBeenCalledTimes(1);
  });

  it('sube el fondo del catálogo', () => {
    api.uploadBackground.and.returnValue(of(void 0));
    const file = new File(['image'], 'catalog.webp', { type: 'image/webp' });
    component.backgroundSelected(false, { target: { files: [file], value: '' } } as any);
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
    component.commercial = { ...settings, pageBackgroundOverlay: 0, catalogBackgroundOverlay: 80, bodyFontFamily: null };
    api.updateCommercial.and.returnValue(of({ storeId: 1, companyId: 1, settings: component.commercial }));
    component.saveCommercial();
    expect(api.updateCommercial).toHaveBeenCalledWith(jasmine.objectContaining({ pageBackgroundOverlay: 0, catalogBackgroundOverlay: 80, bodyFontFamily: null }));
  });

  it('muestra error ante un fallo HTTP al cargar', () => {
    api.store.and.returnValue(throwError(() => ({ error: { code: 'CLOUD_UNAVAILABLE' } })));
    component.load();
    expect(toast.error).toHaveBeenCalled();
  });
});
