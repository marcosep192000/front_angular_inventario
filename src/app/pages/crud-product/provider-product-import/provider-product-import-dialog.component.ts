import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs';
import { Product } from '../../../interfaces/Product';
import {
  ProviderProductImportAnalysis,
  ProviderProductImportDecision,
  ProviderProductImportDefaults,
  ProviderProductImportMapping,
  ProviderProductImportPreview,
  ProviderProductImportResult,
  ProviderProductImportRow,
  ProviderProductImportStatus,
} from '../../../interfaces/provider-product-import';
import { Supplier } from '../../../interfaces/supplier';
import { ProviderProductImportService } from '../../../services/provider-product-import.service';
import { SupplierService } from '../../../services/supplier.service';
import { LinkExistingProductDialogComponent } from '../../crud-supplier/registrar-factura-proveedor/link-existing-product-dialog/link-existing-product-dialog.component';
import { autoMapProviderProduct, backendRowToUi, commercialMoney, percentage, providerImportFileAccepted, statusLabel, uiRowToBackend } from './provider-product-import.utils';

@Component({
  selector: 'app-provider-product-import-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule],
  templateUrl: './provider-product-import-dialog.component.html',
  styleUrl: './provider-product-import-dialog.component.css',
})
export class ProviderProductImportDialogComponent implements OnDestroy {
  step = 1;
  suppliers: Supplier[] = [];
  providerId: number | null = null;
  file: File | null = null;
  preview: ProviderProductImportPreview | null = null;
  analysis: ProviderProductImportAnalysis | null = null;
  analysisId: string | null = null;
  result: ProviderProductImportResult | null = null;
  rows: ProviderProductImportRow[] = [];
  mapping: ProviderProductImportMapping = { sheet: null, headerRow: 0, supplierProductCodeColumn: '', supplierBarcodeColumn: null, productBarcodeColumn: null, nameColumn: '', ivaColumn: null, purchasePriceColumn: '', profitPercentageColumn: null };
  defaults: ProviderProductImportDefaults = { categoryId: null, brandId: null, baseUnitId: null, fractionable: false };
  decisions = new Map<number, ProviderProductImportDecision>();
  uiHeaderRow = 1;
  selectedStatus: 'ALL' | ProviderProductImportStatus = 'ALL';
  searchTerm = '';
  pageIndex = 0;
  pageSize = 50;
  totalElements = 0;
  totalPages = 0;
  analyzing = false;
  loadingRows = false;
  confirming = false;
  error = '';
  fingerprint = '';
  pendingCount: number | null = null;
  private confirmed = false;
  private readonly searchChanges = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(private api: ProviderProductImportService, suppliers: SupplierService, private dialog: MatDialog, private ref: MatDialogRef<ProviderProductImportDialogComponent>, private toast: ToastrService) {
    suppliers.getAllSuppliers().subscribe({ next: x => (this.suppliers = x), error: () => (this.error = 'No se pudieron cargar los proveedores.') });
    this.searchChanges.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0;
      this.loadRows();
    });
  }

  get loading() { return this.analyzing || this.confirming; }
  get visibleRows() { return this.rows; }
  get mappingValid() {
    return !!this.mapping.supplierProductCodeColumn && !!this.mapping.nameColumn && !!this.mapping.purchasePriceColumn && new Set([this.mapping.supplierProductCodeColumn, this.mapping.nameColumn, this.mapping.purchasePriceColumn]).size === 3;
  }
  get canConfirm() { return !!this.analysisId && !!this.analysis && this.fingerprint === this.currentFingerprint() && !this.confirming; }

  choose(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (!providerImportFileAccepted(f)) { this.error = 'Elegí un archivo .xls o .xlsx.'; return; }
    this.discardAnalysis();
    this.file = f;
    this.preview = null;
    this.previewFile();
  }
  providerChanged() { this.discardAnalysis(); }
  previewFile() {
    if (!this.file || !this.providerId) return;
    this.analyzing = true;
    this.api.preview(this.file, uiRowToBackend(this.uiHeaderRow), this.mapping.sheet || undefined).pipe(finalize(() => (this.analyzing = false))).subscribe({
      next: p => {
        this.preview = p;
        this.uiHeaderRow = backendRowToUi(p.headerRow);
        this.mapping = { ...autoMapProviderProduct(p.headers), sheet: p.sheetName, headerRow: p.headerRow };
        this.step = 2;
      },
      error: e => this.fail(e, 'No se pudo leer el Excel.'),
    });
  }
  structureChanged() { this.discardAnalysis(); this.previewFile(); }
  mappingChanged() { this.mapping.headerRow = uiRowToBackend(this.uiHeaderRow); this.discardAnalysis(); }
  analyze() {
    if (!this.file || !this.providerId || !this.mappingValid || this.analyzing) return;
    this.confirmed = false;
    this.analyzing = true;
    this.error = '';
    this.api.analyze(this.file, this.providerId, this.mapping, this.defaults).pipe(finalize(() => (this.analyzing = false))).subscribe({
      next: a => {
        this.analysis = a;
        this.analysisId = a.analysisId;
        this.decisions.clear();
        this.fingerprint = this.currentFingerprint();
        this.pageIndex = 0;
        this.selectedStatus = 'ALL';
        this.searchTerm = '';
        this.step = 4;
        this.loadRows();
      },
      error: e => this.fail(e, 'No se pudo analizar el archivo.'),
    });
  }
  loadRows() {
    if (!this.analysisId || this.loadingRows) return;
    this.loadingRows = true;
    const requestedPage = this.pageIndex;
    this.api.getAnalysisRows(this.analysisId, requestedPage, this.pageSize, this.selectedStatus === 'ALL' ? undefined : this.selectedStatus, this.searchTerm).pipe(finalize(() => (this.loadingRows = false))).subscribe({
      next: page => {
        if (requestedPage > 0 && page.totalElements > 0 && page.content.length === 0) { this.pageIndex = 0; this.loadingRows = false; this.loadRows(); return; }
        this.rows = page.content;
        this.pageIndex = page.page;
        this.pageSize = page.size;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
      },
      error: e => this.handleAnalysisError(e, 'No se pudieron cargar las filas.'),
    });
  }
  pageChange(e: PageEvent) { this.pageIndex = e.pageIndex; this.pageSize = Math.min(200, e.pageSize); this.loadRows(); }
  filterChanged(status: 'ALL' | ProviderProductImportStatus) { this.selectedStatus = status; this.pageIndex = 0; this.loadRows(); }
  searchChanged(value: string) { this.searchTerm = value; this.searchChanges.next(value.trim()); }
  link(row: ProviderProductImportRow) {
    this.dialog.open(LinkExistingProductDialogComponent, { width: '700px', maxWidth: '96vw', data: { providerName: this.supplierName(), supplierProductCode: row.supplierProductCode } }).afterClosed().subscribe((p: Product | undefined) => {
      if (p?.id) this.decisions.set(row.rowNumber, { rowNumber: row.rowNumber, action: 'LINK_EXISTING', productId: p.id, productName: p.name });
    });
  }
  setAction(row: ProviderProductImportRow, action: 'CREATE_NEW' | 'SKIP') { this.decisions.set(row.rowNumber, { rowNumber: row.rowNumber, action }); }
  clearDecision(row: ProviderProductImportRow) { this.decisions.delete(row.rowNumber); }
  confirm() {
    if (!this.analysisId || !this.providerId || !this.canConfirm || this.confirming) return;
    this.confirming = true;
    this.error = '';
    this.api.confirmAnalysis({ analysisId: this.analysisId, providerId: this.providerId, defaultAction: 'CREATE_NEW', overrides: [...this.decisions.values()] }).pipe(finalize(() => (this.confirming = false))).subscribe({
      next: r => {
        this.result = r;
        this.confirmed = true;
        this.analysisId = null;
        this.rows = [];
        this.step = 7;
        this.toast.success('Importación completada.');
      },
      error: e => this.handleConfirmError(e),
    });
  }
  newImport() { this.discardAnalysis(); this.confirmed = false; this.step = 1; this.file = null; this.preview = null; this.analysis = null; this.result = null; }
  finish() { this.ref.close({ imported: true }); }
  status(s: ProviderProductImportStatus) { return statusLabel(s); }
  price(v: number | null) { return commercialMoney(v); }
  profit(v: number | null) { return percentage(v); }
  decision(row: ProviderProductImportRow) { return this.decisions.get(row.rowNumber); }
  supplierName() { return this.suppliers.find(x => x.id === this.providerId)?.name ?? ''; }
  close() {
    if ((this.analysisId || this.decisions.size) && !confirm('Se perderá el análisis actual. ¿Cerrar igualmente?')) return;
    this.discardAnalysis();
    this.ref.close();
  }
  track(_: number, r: ProviderProductImportRow) { return r.rowNumber; }
  ngOnDestroy() { if (!this.confirmed) this.discardAnalysis(); this.destroy$.next(); this.destroy$.complete(); }

  private currentFingerprint() { return `${this.providerId}|${this.file?.name}|${this.file?.size}|${JSON.stringify(this.mapping)}`; }
  private discardAnalysis() {
    const id = this.analysisId;
    this.analysisId = null;
    this.analysis = null;
    this.result = null;
    this.rows = [];
    this.totalElements = 0;
    this.totalPages = 0;
    this.decisions.clear();
    this.fingerprint = '';
    this.pendingCount = null;
    this.error = '';
    if (id && !this.confirmed) this.api.deleteAnalysis(id).subscribe({ error: () => undefined });
  }
  private handleConfirmError(e: unknown) {
    const code = this.errorCode(e);
    if (code === 'UNRESOLVED_IMPORT_ROWS') {
      const message = this.errorMessage(e) || 'Existen productos que requieren vinculación manual.';
      const count = message.match(/\d+/)?.[0];
      this.pendingCount = count ? Number(count) : null;
      this.error = message;
      this.selectedStatus = 'LINK_EXISTING_REQUIRED';
      this.pageIndex = 0;
      this.step = 5;
      this.loadRows();
      return;
    }
    if (code === 'IMPORT_ANALYSIS_ALREADY_PROCESSING') { this.error = 'La importación ya se está procesando.'; return; }
    if (this.isInvalidAnalysis(code)) { this.expireAnalysis(code); return; }
    this.fail(e, 'No se pudo completar la importación.');
  }
  private handleAnalysisError(e: unknown, fallback: string) {
    const code = this.errorCode(e);
    if (this.isInvalidAnalysis(code)) { this.expireAnalysis(code); return; }
    this.fail(e, fallback);
  }
  private expireAnalysis(code: string) {
    this.analysisId = null;
    this.analysis = null;
    this.rows = [];
    this.decisions.clear();
    this.totalElements = 0;
    this.totalPages = 0;
    this.fingerprint = '';
    this.step = this.preview ? 3 : 1;
    this.error = code === 'IMPORT_ANALYSIS_EXPIRED' ? 'El análisis venció. Volvé a analizar el archivo.' : 'El análisis ya no está disponible. Volvé a analizar el archivo.';
  }
  private isInvalidAnalysis(code: string) { return code === 'IMPORT_ANALYSIS_EXPIRED' || code === 'IMPORT_ANALYSIS_NOT_FOUND'; }
  private errorCode(e: unknown) { const x = e as { error?: { error?: string; code?: string } }; return x?.error?.error || x?.error?.code || ''; }
  private errorMessage(e: unknown) { const x = e as { error?: { message?: string } }; return x?.error?.message || ''; }
  private fail(e: unknown, fallback: string) {
    const code = this.errorCode(e);
    const messages: Record<string, string> = { PRODUCT_LIMIT_EXCEEDED: 'La licencia no tiene capacidad suficiente para crear todos los productos.', INVALID_PRICE: 'Hay precios inválidos o ambiguos en el archivo.' };
    this.error = this.errorMessage(e) || messages[code] || fallback;
  }
}
