import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import {
  SupplierPriceListExcelImportResult,
  SupplierPriceListExcelMapping,
  SupplierPriceListExcelPreview,
  SupplierPriceListExcelRowError,
  SupplierPriceListExcelValidation,
} from '../../interfaces/supplier-price-list';
import { SupplierPriceListService } from '../../services/supplier-price-list.service';
import {
  autoMapExcel,
  backendRowToUi,
  excelErrorMessage,
  excelFileAccepted,
  mappingFingerprint,
  uiRowToBackend,
} from './supplier-price-list-excel.utils';
@Component({
  selector: 'app-supplier-price-list-excel-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './supplier-price-list-excel-import-dialog.component.html',
  styleUrl: './supplier-price-list-excel-import-dialog.component.css',
})
export class SupplierPriceListExcelImportDialogComponent {
  step = 1;
  file: null | File = null;
  preview: null | SupplierPriceListExcelPreview = null;
  validation: null | SupplierPriceListExcelValidation = null;
  result: null | SupplierPriceListExcelImportResult = null;
  mapping: SupplierPriceListExcelMapping = {
    sheet: null,
    headerRow: 0,
    supplierProductCodeColumn: null,
    supplierBarcodeColumn: null,
    descriptionColumn: null,
    offeredPriceColumn: '',
  };
  uiHeaderRow = 1;
  previewing = false;
  validating = false;
  importing = false;
  error = '';
  errorFilter = 'ALL';
  validatedFingerprint = '';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { priceListId: number; listName: string },
    private api: SupplierPriceListService,
    private toast: ToastrService,
    private ref: MatDialogRef<SupplierPriceListExcelImportDialogComponent>,
  ) {}
  get busy() {
    return this.previewing || this.validating || this.importing;
  }
  get mappingValid() {
    return (
      !!this.mapping.offeredPriceColumn &&
      (!!this.mapping.supplierProductCodeColumn ||
        !!this.mapping.supplierBarcodeColumn)
    );
  }
  get validationCurrent() {
    return (
      !!this.file &&
      this.validatedFingerprint === mappingFingerprint(this.file, this.mapping)
    );
  }
  get canImport() {
    return (
      !!this.validation &&
      this.validationCurrent &&
      this.validation.valid !== false &&
      this.validation.invalidRows === 0 &&
      this.validation.duplicateRows === 0
    );
  }
  get filteredErrors() {
    const errors = this.validation?.errors ?? [];
    return this.errorFilter === 'ALL'
      ? errors
      : errors.filter(
          (x) =>
            x.errorCode === this.errorFilter || x.field === this.errorFilter,
        );
  }
  get errorFilters() {
    return [
      ...new Set(
        (this.validation?.errors ?? [])
          .flatMap((x) => [x.errorCode, x.field])
          .filter(Boolean),
      ),
    ];
  }
  choose(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    if (!excelFileAccepted(file)) {
      this.error = 'Elegí un archivo Excel con extensión .xls o .xlsx.';
      return;
    }
    this.file = file;
    this.invalidate(true);
    this.loadPreview();
  }
  loadPreview() {
    if (!this.file || this.previewing) return;
    this.previewing = true;
    this.error = '';
    this.api
      .previewExcel(
        this.file,
        uiRowToBackend(this.uiHeaderRow),
        this.mapping.sheet || undefined,
      )
      .pipe(finalize(() => (this.previewing = false)))
      .subscribe({
        next: (p) => {
          this.preview = p;
          this.uiHeaderRow = backendRowToUi(p.headerRow);
          const detected = autoMapExcel(p.headers);
          this.mapping = {
            ...detected,
            sheet: p.sheetName,
            headerRow: p.headerRow,
          };
          this.step = 2;
        },
        error: (e) =>
          (this.error = this.message(
            e,
            'No se pudo leer la estructura del Excel.',
          )),
      });
  }
  structureChanged() {
    this.invalidate();
    this.loadPreview();
  }
  mappingChanged() {
    this.mapping.headerRow = uiRowToBackend(this.uiHeaderRow);
    this.invalidate();
  }
  validate() {
    if (!this.file || !this.mappingValid || this.validating) return;
    this.mapping.headerRow = uiRowToBackend(this.uiHeaderRow);
    this.validating = true;
    this.error = '';
    this.api
      .validateExcel(this.data.priceListId, this.file, this.mapping)
      .pipe(finalize(() => (this.validating = false)))
      .subscribe({
        next: (v) => {
          this.validation = v;
          this.validatedFingerprint = mappingFingerprint(
            this.file!,
            this.mapping,
          );
          this.step = 4;
        },
        error: (e: HttpErrorResponse) => {
          const v = e.error?.validation;
          if (e.status === 422 && v) {
            this.validation = v;
            this.validatedFingerprint = mappingFingerprint(
              this.file!,
              this.mapping,
            );
            this.step = 4;
          }
          this.error = this.message(e, 'No se pudo validar el archivo.');
        },
      });
  }
  import() {
    if (!this.file || !this.canImport || this.importing) return;
    this.importing = true;
    this.error = '';
    this.api
      .importExcel(this.data.priceListId, this.file, this.mapping)
      .pipe(finalize(() => (this.importing = false)))
      .subscribe({
        next: (r) => {
          this.result = r;
          this.step = 5;
          this.toast.success('Lista de precios importada correctamente.');
        },
        error: (e: HttpErrorResponse) => {
          if (e.status === 422 && e.error?.validation) {
            this.validation = e.error.validation;
            this.step = 4;
          }
          this.error = this.message(e, 'No se pudo importar el archivo.');
        },
      });
  }
  finish(showUnmatched = false) {
    this.ref.close({ imported: true, showUnmatched });
  }
  row(n: number) {
    return n;
  }
  describe(e: SupplierPriceListExcelRowError) {
    return excelErrorMessage(e);
  }
  private invalidate(clearPreview = false) {
    this.validation = null;
    this.result = null;
    this.validatedFingerprint = '';
    this.error = '';
    if (clearPreview) this.preview = null;
  }
  private message(e: any, fallback: string) {
    return e?.error?.message || e?.error?.error || fallback;
  }
}
