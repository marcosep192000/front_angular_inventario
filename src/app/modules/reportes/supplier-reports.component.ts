import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Product } from '../../interfaces/Product';
import { Supplier } from '../../interfaces/supplier';
import { CostAlert, CostHistoryItem, ProductComparisonSummary, ProductSupplierComparison, ProviderInvoiceReport, ProviderProductReport, ProviderPurchaseSummary, ReportPage, SavingsRequestItem, SavingsResponse } from '../../interfaces/supplier-report';
import { InventorySupplierReportService } from '../../services/inventory-supplier-report.service';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../services/supplier.service';
import { costAlertLabel, reportErrorMessage } from './supplier-reports.utils';

interface SavingsDraft extends SavingsRequestItem { productName: string; }
@Component({ selector: 'app-supplier-reports', standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTabsModule, RouterLink],
  templateUrl: './supplier-reports.component.html', styleUrl: './supplier-reports.component.css' })
export class SupplierReportsComponent implements OnInit {
  suppliers: Supplier[] = []; productQuery = ''; productResults: Product[] = []; searchingProducts = false;
  comparison: ProductSupplierComparison | null = null; loadingComparison = false; comparisonError = '';
  bulkProducts: Product[] = []; bulkComparisons: ProductComparisonSummary[] = [];
  historyProduct: Product | null = null; history: ReportPage<CostHistoryItem> | null = null; historyProviderId: number | null = null; historyFrom = ''; historyTo = ''; loadingHistory = false;
  purchaseProviderId: number | null = null; purchaseFrom = ''; purchaseTo = ''; purchases: ProviderPurchaseSummary[] = []; loadingPurchases = false;
  selectedProvider: ProviderPurchaseSummary | null = null; providerInvoices: ReportPage<ProviderInvoiceReport> | null = null; providerProducts: ReportPage<ProviderProductReport> | null = null; providerProductSearch = ''; preferredOnly = false; withPriceOnly = false; loadingProviderDetail = false;
  alerts: ReportPage<CostAlert> | null = null; loadingAlerts = false;
  savingsDraft: SavingsDraft[] = []; savings: SavingsResponse | null = null; loadingSavings = false;
  private loadedTabs = new Set<number>();
  constructor(private api: InventorySupplierReportService, private productsApi: ProductService, private suppliersApi: SupplierService) {}
  ngOnInit(): void { this.suppliersApi.getAllSuppliers().subscribe({ next: x => this.suppliers = x }); }
  tabChanged(index: number): void { if (this.loadedTabs.has(index)) return; this.loadedTabs.add(index); if (index === 2) this.loadPurchases(); if (index === 3) this.loadAlerts(); }
  searchProducts(): void { const q=this.productQuery.trim(); if(!q||this.searchingProducts)return; this.searchingProducts=true; this.productsApi.getProducts(0,15,q).pipe(finalize(()=>this.searchingProducts=false)).subscribe({next:r=>this.productResults=r?.content??[],error:()=>this.productResults=[]}); }
  compare(product: Product): void { if(!product.id||this.loadingComparison)return; this.comparison=null;this.comparisonError='';this.loadingComparison=true;this.api.getProductComparison(product.id).pipe(finalize(()=>this.loadingComparison=false)).subscribe({next:r=>this.comparison=r,error:e=>this.comparisonError=reportErrorMessage(e)}); }
  addBulk(product: Product): void { if(product.id&&!this.bulkProducts.some(x=>x.id===product.id))this.bulkProducts=[...this.bulkProducts,product]; }
  removeBulk(id?:number):void{this.bulkProducts=this.bulkProducts.filter(x=>x.id!==id);}
  compareBulk():void{const ids=this.bulkProducts.map(x=>x.id).filter((x):x is number=>x!=null);if(!ids.length||this.loadingComparison)return;this.loadingComparison=true;this.api.compareProducts(ids).pipe(finalize(()=>this.loadingComparison=false)).subscribe({next:r=>this.bulkComparisons=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  selectHistoryProduct(product:Product):void{this.historyProduct=product;this.loadHistory(0,10);}
  loadHistory(page=0,size=10):void{if(!this.historyProduct?.id||this.loadingHistory)return;this.loadingHistory=true;this.api.getCostHistory(this.historyProduct.id,{providerId:this.historyProviderId,from:this.historyFrom,to:this.historyTo,page,size}).pipe(finalize(()=>this.loadingHistory=false)).subscribe({next:r=>this.history=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  historyPage(e:PageEvent):void{this.loadHistory(e.pageIndex,e.pageSize);}
  loadPurchases():void{if(this.loadingPurchases)return;this.loadingPurchases=true;this.api.getProviderPurchaseSummary({providerId:this.purchaseProviderId,from:this.purchaseFrom,to:this.purchaseTo}).pipe(finalize(()=>this.loadingPurchases=false)).subscribe({next:r=>this.purchases=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  openProvider(row:ProviderPurchaseSummary):void{this.selectedProvider=row;this.loadProviderInvoices(0,10);this.loadProviderProducts(0,10);}
  loadProviderInvoices(page=0,size=10):void{if(!this.selectedProvider||this.loadingProviderDetail)return;this.loadingProviderDetail=true;this.api.getProviderPurchases(this.selectedProvider.providerId,{from:this.purchaseFrom,to:this.purchaseTo,page,size}).pipe(finalize(()=>this.loadingProviderDetail=false)).subscribe({next:r=>this.providerInvoices=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  loadProviderProducts(page=0,size=10):void{if(!this.selectedProvider)return;this.api.getProviderProducts(this.selectedProvider.providerId,{search:this.providerProductSearch,preferredOnly:this.preferredOnly,withPriceOnly:this.withPriceOnly,page,size}).subscribe({next:r=>this.providerProducts=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  loadAlerts(page=0,size=10):void{if(this.loadingAlerts)return;this.loadingAlerts=true;this.api.getCostAlerts(page,size).pipe(finalize(()=>this.loadingAlerts=false)).subscribe({next:r=>this.alerts=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  alertPage(e:PageEvent):void{this.loadAlerts(e.pageIndex,e.pageSize);} alertLabel(type:string):string{return costAlertLabel(type);}
  addSavingsProduct(product:Product):void{if(product.id&&!this.savingsDraft.some(x=>x.productId===product.id))this.savingsDraft=[...this.savingsDraft,{productId:product.id,productName:product.name,quantity:1}];}
  removeSavings(productId:number):void{this.savingsDraft=this.savingsDraft.filter(x=>x.productId!==productId);this.savings=null;}
  calculateSavings():void{if(this.loadingSavings||!this.savingsDraft.length||this.savingsDraft.some(x=>!Number.isFinite(Number(x.quantity))||Number(x.quantity)<=0))return;this.loadingSavings=true;const items=this.savingsDraft.map(({productId,quantity})=>({productId,quantity:Number(quantity)}));this.api.calculatePotentialSavings(items).pipe(finalize(()=>this.loadingSavings=false)).subscribe({next:r=>this.savings=r,error:e=>this.comparisonError=reportErrorMessage(e)});}
  moneyMissing(value:number|null|undefined):boolean{return value==null;}
}
