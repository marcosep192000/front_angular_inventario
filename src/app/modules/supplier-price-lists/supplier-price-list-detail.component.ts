import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { Product } from '../../interfaces/Product';
import { ReportPage } from '../../interfaces/supplier-report';
import {
  SupplierPriceListDetail,
  SupplierPriceListItem,
  SupplierPriceListMatchType,
  SupplierPriceMarketComparison,
} from '../../interfaces/supplier-price-list';
import { SupplierPriceListService } from '../../services/supplier-price-list.service';
import { TokenService } from '../../services/token.service';
import { DialogGenericComponent } from '../../shared/genericsComponents/dialog-generic/dialog-generic.component';
import { LinkExistingProductDialogComponent } from '../../pages/crud-supplier/registrar-factura-proveedor/link-existing-product-dialog/link-existing-product-dialog.component';
import { AddPriceListItemDialogComponent } from './add-price-list-item-dialog.component';
import { SupplierPriceListExcelImportDialogComponent } from './supplier-price-list-excel-import-dialog.component';
import {
  canUnlink,
  COMPARISON_STATUS,
  MATCH_TYPE,
  PRICE_LIST_STATUS,
  priceListError,
} from './supplier-price-list.utils';
type Filter =
  'ALL' | 'MATCHED' | 'UNMATCHED' | 'INCREASE' | 'DECREASE' | 'BEST';
@Component({
  selector: 'app-supplier-price-list-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './supplier-price-list-detail.component.html',
  styleUrl: './supplier-price-list-detail.component.css',
})
export class SupplierPriceListDetailComponent implements OnInit {
  id = Number(this.route.snapshot.paramMap.get('id'));
  detail: SupplierPriceListDetail | null = null;
  items: ReportPage<SupplierPriceListItem> | null = null;
  comparison: ReportPage<SupplierPriceListItem> | null = null;
  market: ReportPage<SupplierPriceMarketComparison> | null = null;
  loadingDetail = false;
  loadingItems = false;
  loadingComparison = false;
  loadingMarket = false;
  changingStatus = false;
  linkingProduct = false;
  search = '';
  filter: Filter = 'ALL';
  error = '';
  constructor(
    private route: ActivatedRoute,
    private api: SupplierPriceListService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private tokens: TokenService,
  ) {}
  ngOnInit() {
    this.loadDetail();
    this.loadItems();
  }
  get canWrite() {
    const r = this.tokens.getAuthorities();
    return (
      this.tokens.hasPermission('COMPRAS_REGISTRAR') ||
      r.includes('ADMIN') ||
      r.includes('ROLE_ADMIN')
    );
  }
  get editable() {
    return this.canWrite && this.detail?.list.status === 'DRAFT';
  }
  statusLabel() {
    return this.detail ? PRICE_LIST_STATUS[this.detail.list.status] : '';
  }
  matchLabel(x: SupplierPriceListMatchType) {
    return MATCH_TYPE[x];
  }
  comparisonLabel(x: string) {
    return COMPARISON_STATUS[x] ?? x;
  }
  canUnlink(x: SupplierPriceListItem) {
    return this.editable && canUnlink(x.matchType);
  }
  loadDetail() {
    if (this.loadingDetail) return;
    this.loadingDetail = true;
    this.api
      .getPriceList(this.id)
      .pipe(finalize(() => (this.loadingDetail = false)))
      .subscribe({
        next: (x) => (this.detail = x),
        error: (e) => (this.error = priceListError(e)),
      });
  }
  loadItems(page = 0, size = 20) {
    if (this.loadingItems) return;
    this.loadingItems = true;
    const f: Parameters<SupplierPriceListService['getItems']>[1] = {
      search: this.search.trim() || undefined,
      page,
      size,
    };
    if (this.filter === 'MATCHED') f.matched = true;
    if (this.filter === 'UNMATCHED') f.matched = false;
    if (this.filter === 'INCREASE') f.increaseOnly = true;
    if (this.filter === 'DECREASE') f.decreaseOnly = true;
    if (this.filter === 'BEST') f.betterThanCurrentBest = true;
    this.api
      .getItems(this.id, f)
      .pipe(finalize(() => (this.loadingItems = false)))
      .subscribe({
        next: (x) => (this.items = x),
        error: (e) => (this.error = priceListError(e)),
      });
  }
  itemsPage(e: PageEvent) {
    this.loadItems(e.pageIndex, e.pageSize);
  }
  tab(index: number) {
    if (index === 1 && !this.comparison) this.loadComparison();
    if (index === 2 && !this.market) this.loadMarket();
  }
  loadComparison(page = 0, size = 20) {
    if (this.loadingComparison) return;
    this.loadingComparison = true;
    this.api
      .getComparison(this.id, page, size)
      .pipe(finalize(() => (this.loadingComparison = false)))
      .subscribe({
        next: (x) => (this.comparison = x),
        error: (e) => (this.error = priceListError(e)),
      });
  }
  loadMarket(page = 0, size = 20) {
    if (this.loadingMarket) return;
    this.loadingMarket = true;
    this.api
      .getMarketComparison(this.id, page, size)
      .pipe(finalize(() => (this.loadingMarket = false)))
      .subscribe({
        next: (x) => (this.market = x),
        error: (e) => (this.error = priceListError(e)),
      });
  }
  addItem() {
    if (!this.editable) return;
    this.dialog
      .open(AddPriceListItemDialogComponent, {
        width: '620px',
        maxWidth: '96vw',
        disableClose: true,
        data: { listId: this.id },
      })
      .afterClosed()
      .subscribe((r) => {
        if (r?.saved) {
          this.refresh();
        }
      });
  }
  importExcel() {
    if (!this.editable) return;
    this.dialog.open(SupplierPriceListExcelImportDialogComponent, {
      width: '980px', maxWidth: '98vw', maxHeight: '94vh', disableClose: true,
      data: { priceListId: this.id, listName: this.detail!.list.name },
    }).afterClosed().subscribe((result) => {
      if (!result?.imported) return;
      if (result.showUnmatched) this.filter = 'UNMATCHED';
      this.refresh();
    });
  }
  link(item: SupplierPriceListItem) {
    if (!this.editable || this.linkingProduct) return;
    this.dialog
      .open(LinkExistingProductDialogComponent, {
        width: '680px',
        maxWidth: '96vw',
        disableClose: true,
        data: {
          providerName: this.detail!.list.providerName,
          supplierProductCode:
            item.supplierProductCode ||
            item.descriptionSnapshot ||
            'Sin código',
        },
      })
      .afterClosed()
      .subscribe((p: Product | undefined) => {
        if (!p?.id) return;
        this.linkingProduct = true;
        this.api
          .linkProduct(item.id, p.id)
          .pipe(finalize(() => (this.linkingProduct = false)))
          .subscribe({
            next: () => {
              this.toast.success('Producto vinculado correctamente.');
              this.refresh();
            },
            error: (e) => this.toast.error(priceListError(e)),
          });
      });
  }
  unlink(item: SupplierPriceListItem) {
    if (!this.canUnlink(item)) return;
    this.confirm(
      'Desvincular producto',
      'Se quitará únicamente el vínculo manual. La lista y el producto no serán eliminados.',
      'Desvincular',
      () => this.api.unlink(item.id),
      'Producto desvinculado.',
    );
  }
  review() {
    if (!this.editable) return;
    this.confirm(
      'Marcar lista como revisada',
      'Esta acción marcará la lista como revisada. No se modificarán costos ni stock.',
      'Marcar revisada',
      () => this.api.review(this.id),
      'Lista marcada como revisada.',
    );
  }
  archive() {
    if (!this.canWrite || this.detail?.list.status !== 'REVIEWED') return;
    this.confirm(
      'Archivar lista',
      'La lista quedará en modo de sólo lectura y no podrá restaurarse desde esta pantalla.',
      'Archivar',
      () => this.api.archive(this.id),
      'Lista archivada.',
    );
  }
  private confirm(
    title: string,
    message: string,
    state: string,
    operation: () => any,
    success: string,
  ) {
    this.dialog
      .open(DialogGenericComponent, {
        width: '460px',
        disableClose: true,
        data: { component: '', data: title, state, icon: '', message },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok !== true || this.changingStatus) return;
        this.changingStatus = true;
        operation()
          .pipe(finalize(() => (this.changingStatus = false)))
          .subscribe({
            next: () => {
              this.toast.success(success);
              this.refresh();
            },
            error: (e: any) => this.toast.error(priceListError(e)),
          });
      });
  }
  private refresh() {
    this.comparison = null;
    this.market = null;
    this.loadDetail();
    this.loadItems(this.items?.pagina ?? 0, this.items?.tamanio ?? 20);
  }
}
