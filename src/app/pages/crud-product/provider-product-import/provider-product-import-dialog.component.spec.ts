import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ProviderProductImportDialogComponent } from './provider-product-import-dialog.component';

describe('ProviderProductImportDialogComponent server-side analysis', () => {
  let api: jasmine.SpyObj<any>;
  let ref: jasmine.SpyObj<any>;
  let component: ProviderProductImportDialogComponent;
  const row = (rowNumber: number, status = 'NEW_PRODUCT') => ({ rowNumber, status, supplierProductCode: `00${rowNumber}`, supplierBarcode: null, productBarcode: null, name: `Producto ${rowNumber}`, iva: 21, purchasePrice: 100, profitPercentage: 30, productId: null, productName: null, productSupplierId: null, currentSupplierPrice: null, message: null } as any);
  const analysis = { analysisId: 'analysis-1', providerId: 7, expiresAt: '2026-09-06T18:00:00Z', totalRows: 8065, validRows: 8065, alreadyLinked: 0, newProducts: 8065, requiresReview: 0, invalidRows: 0, sample: [row(999)] } as any;
  const page = (content = [row(2)], pageIndex = 0, total = 8065) => ({ content, page: pageIndex, size: 50, totalElements: total, totalPages: Math.ceil(total / 50) });

  beforeEach(() => {
    api = jasmine.createSpyObj('ProviderProductImportService', ['preview', 'analyze', 'getAnalysisRows', 'confirmAnalysis', 'deleteAnalysis']);
    api.analyze.and.returnValue(of(analysis));
    api.getAnalysisRows.and.returnValue(of(page()));
    api.deleteAnalysis.and.returnValue(of(undefined));
    api.confirmAnalysis.and.returnValue(of({}));
    ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    component = new ProviderProductImportDialogComponent(api, { getAllSuppliers: () => of([{ id: 7, name: 'Proveedor' }]) } as any, { open: () => ({ afterClosed: () => of(undefined) }) } as any, ref, jasmine.createSpyObj('ToastrService', ['success']) as any);
    component.providerId = 7;
    component.file = new File(['x'], 'productos.xlsx');
    component.mapping = { sheet: 'Sheet1', headerRow: 0, supplierProductCodeColumn: 'CODIGO', supplierBarcodeColumn: null, productBarcodeColumn: null, nameColumn: 'NOMBRE', ivaColumn: null, purchasePriceColumn: 'PRECIO', profitPercentageColumn: null };
  });

  it('stores analysisId, loads page zero and never uses sample as table data', () => {
    component.analyze();
    expect(component.analysisId).toBe('analysis-1');
    expect(api.getAnalysisRows).toHaveBeenCalledWith('analysis-1', 0, 50, undefined, '');
    expect(component.rows.map(x => x.rowNumber)).toEqual([2]);
    expect(component.totalElements).toBe(8065);
    expect(component.analysis?.totalRows).toBe(8065);
  });

  it('loads only the requested page and respects page size', () => {
    component.analyze();
    api.getAnalysisRows.calls.reset();
    api.getAnalysisRows.and.returnValue(of(page([row(101)], 2)));
    component.pageChange({ pageIndex: 2, pageSize: 100, length: 8065 } as any);
    expect(api.getAnalysisRows).toHaveBeenCalledWith('analysis-1', 2, 100, undefined, '');
    expect(component.rows.map(x => x.rowNumber)).toEqual([101]);
  });

  it('resets page and sends backend status filters', () => {
    component.analyze();
    component.pageIndex = 4;
    api.getAnalysisRows.calls.reset();
    component.filterChanged('LINK_EXISTING_REQUIRED');
    expect(component.pageIndex).toBe(0);
    expect(api.getAnalysisRows).toHaveBeenCalledWith('analysis-1', 0, 50, 'LINK_EXISTING_REQUIRED', '');
  });

  it('debounces backend search and preserves leading zeroes', fakeAsync(() => {
    component.analyze();
    component.pageIndex = 8;
    api.getAnalysisRows.calls.reset();
    component.searchChanged('  00125  ');
    tick(349);
    expect(api.getAnalysisRows).not.toHaveBeenCalled();
    tick(1);
    expect(component.pageIndex).toBe(0);
    expect(api.getAnalysisRows).toHaveBeenCalledWith('analysis-1', 0, 50, undefined, '  00125  ');
  }));

  it('preserves LINK_EXISTING and SKIP overrides independently of the current page', () => {
    const first = row(245, 'LINK_EXISTING_REQUIRED');
    component.decisions.set(245, { rowNumber: 245, action: 'LINK_EXISTING', productId: 42, productName: 'Electrodo 2.5' });
    component.setAction(row(302), 'SKIP');
    component.rows = [row(900)];
    expect(component.decision(first)?.productId).toBe(42);
    expect(component.decisions.get(302)?.action).toBe('SKIP');
  });

  it('confirms once with analysisId and only local overrides', () => {
    const pending = new Subject<any>();
    api.confirmAnalysis.and.returnValue(pending);
    component.analyze();
    component.decisions.set(302, { rowNumber: 302, action: 'SKIP' });
    component.confirm();
    component.confirm();
    expect(api.confirmAnalysis).toHaveBeenCalledOnceWith({ analysisId: 'analysis-1', providerId: 7, defaultAction: 'CREATE_NEW', overrides: [{ rowNumber: 302, action: 'SKIP' }] });
  });

  it('shows unresolved count and opens the global review filter', () => {
    api.confirmAnalysis.and.returnValue(throwError(() => ({ error: { error: 'UNRESOLVED_IMPORT_ROWS', message: 'Existen 37 productos que requieren vinculación manual.' } })));
    component.analyze();
    component.confirm();
    expect(component.pendingCount).toBe(37);
    expect(component.selectedStatus).toBe('LINK_EXISTING_REQUIRED');
    expect(component.pageIndex).toBe(0);
    expect(component.error).toContain('37');
  });

  it('recovers from expiration without closing the wizard', () => {
    component.preview = { sheetName: 'Sheet1', availableSheets: ['Sheet1'], headerRow: 0, headers: [], sampleRows: [], totalRowsDetected: 1 };
    api.getAnalysisRows.and.returnValue(throwError(() => ({ error: { error: 'IMPORT_ANALYSIS_EXPIRED' } })));
    component.analyze();
    expect(component.analysisId).toBeNull();
    expect(component.rows).toEqual([]);
    expect(component.step).toBe(3);
    expect(component.error).toBe('El análisis venció. Volvé a analizar el archivo.');
    expect(ref.close).not.toHaveBeenCalled();
  });

  it('handles an analysis that is no longer available', () => {
    component.preview = { sheetName: 'Sheet1', availableSheets: ['Sheet1'], headerRow: 0, headers: [], sampleRows: [], totalRowsDetected: 1 };
    api.getAnalysisRows.and.returnValue(throwError(() => ({ error: { error: 'IMPORT_ANALYSIS_NOT_FOUND' } })));
    component.analyze();
    expect(component.analysisId).toBeNull();
    expect(component.step).toBe(3);
    expect(component.error).toContain('ya no está disponible');
  });

  it('best-effort deletes on invalidation and does not delete after successful confirm', () => {
    component.analyze();
    component.mappingChanged();
    expect(api.deleteAnalysis).toHaveBeenCalledWith('analysis-1');

    api.deleteAnalysis.calls.reset();
    component.analyze();
    component.confirm();
    component.ngOnDestroy();
    expect(api.deleteAnalysis).not.toHaveBeenCalled();
  });

  it('invalidates the active analysis when provider or file changes', () => {
    component.analyze();
    component.providerChanged();
    expect(api.deleteAnalysis).toHaveBeenCalledWith('analysis-1');

    api.deleteAnalysis.calls.reset();
    component.analyze();
    api.preview.and.returnValue(of({ sheetName: 'Sheet1', availableSheets: ['Sheet1'], headerRow: 0, headers: ['CODIGO', 'NOMBRE', 'PRECIO'], sampleRows: [], totalRowsDetected: 1 }));
    component.choose({ target: { files: [new File(['new'], 'nuevo.xlsx')] } } as any);
    expect(api.deleteAnalysis).toHaveBeenCalledWith('analysis-1');
  });

  it('closes even when best-effort DELETE fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    api.deleteAnalysis.and.returnValue(throwError(() => new Error('network')));
    component.analyze();
    component.close();
    expect(api.deleteAnalysis).toHaveBeenCalledWith('analysis-1');
    expect(ref.close).toHaveBeenCalled();
  });
});
