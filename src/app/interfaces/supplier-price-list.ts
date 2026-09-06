import { ReportPage } from './supplier-report';
export type SupplierPriceListStatus = 'DRAFT' | 'REVIEWED' | 'ARCHIVED';
export type SupplierPriceListMatchType =
  | 'SUPPLIER_PRODUCT_CODE'
  | 'SUPPLIER_BARCODE'
  | 'MANUAL_PRODUCT_LINK'
  | 'UNMATCHED';
export interface SupplierPriceListSummary {
  id: number;
  providerId: number;
  providerName: string;
  name: string;
  referenceDate: string;
  validFrom: string | null;
  validUntil: string | null;
  status: SupplierPriceListStatus;
  itemCount: number;
  matchedCount: number;
  unmatchedCount: number;
  createdAt: string;
}
export interface SupplierPriceListStatistics {
  totalItems: number;
  matchedItems: number;
  unmatchedItems: number;
  increasedItems: number;
  decreasedItems: number;
  unchangedItems: number;
  newBestPriceItems: number;
  itemsWithoutComparison: number;
  averageIncreasePercentage: number | null;
  averageDecreasePercentage: number | null;
}
export interface SupplierPriceListDetail {
  list: SupplierPriceListSummary;
  statistics: SupplierPriceListStatistics;
  sourceFileName: string | null;
  notes: string | null;
  receivedAt: string;
  updatedAt: string;
}
export interface CreateSupplierPriceListRequest {
  providerId: number;
  name: string;
  referenceDate: string;
  validFrom: string | null;
  validUntil: string | null;
  sourceFileName: null;
  notes: string | null;
}
export interface SupplierPriceListItemRequest {
  supplierProductCode: string | null;
  supplierBarcode: string | null;
  description: string | null;
  offeredPrice: number;
}
export interface SupplierPriceListItem {
  id: number;
  productId: number | null;
  productName: string | null;
  productBarcode: string | null;
  productSupplierId: number | null;
  supplierProductCode: string | null;
  supplierBarcode: string | null;
  descriptionSnapshot: string | null;
  offeredPrice: number;
  previousListPrice: number | null;
  lastPurchasePriceSnapshot: number | null;
  purchasePriceSnapshot: number | null;
  bestKnownPriceSnapshot: number | null;
  bestKnownProviderIdSnapshot: number | null;
  bestKnownProviderName: string | null;
  matched: boolean;
  matchType: SupplierPriceListMatchType;
  differenceVsLastPurchase: number | null;
  differencePercentageVsLastPurchase: number | null;
  differenceVsPreviousList: number | null;
  differencePercentageVsPreviousList: number | null;
  differenceVsBestKnown: number | null;
  differencePercentageVsBestKnown: number | null;
  priceIncreased: boolean;
  priceDecreased: boolean;
  newBestPrice: boolean;
  moreExpensiveThanBest: boolean;
  noComparison: boolean;
  listComparisonStatus: 'NEW' | 'INCREASED' | 'DECREASED' | 'UNCHANGED';
}
export interface SupplierPriceMarketComparison {
  itemId: number;
  productId: number;
  productName: string;
  offeredPrice: number;
  listProviderId: number;
  listProviderName: string;
  bestKnownPrice: number | null;
  bestKnownProviderId: number | null;
  bestKnownProviderName: string | null;
  differenceVsBest: number | null;
  differencePercentageVsBest: number | null;
  newBestPrice: boolean;
}
export type SupplierPriceListPage = ReportPage<SupplierPriceListSummary>;
export interface SupplierPriceListExcelMapping {
  sheet: string | null;
  headerRow: number;
  supplierProductCodeColumn: string | null;
  supplierBarcodeColumn: string | null;
  descriptionColumn: string | null;
  offeredPriceColumn: string;
}
export interface SupplierPriceListExcelPreview {
  sheetName: string;
  availableSheets: string[];
  headerRow: number;
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRowsDetected: number;
}
export interface SupplierPriceListExcelRowError {
  rowNumber: number;
  field: string;
  errorCode: string;
  message: string;
}
export interface SupplierPriceListExcelParsedRow {
  rowNumber: number;
  supplierProductCode: string | null;
  supplierBarcode: string | null;
  description: string | null;
  offeredPrice: number | null;
  valid: boolean;
  errors: SupplierPriceListExcelRowError[];
}
export interface SupplierPriceListExcelValidation {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  sample: SupplierPriceListExcelParsedRow[];
  errors: SupplierPriceListExcelRowError[];
  valid: boolean;
}
export interface SupplierPriceListExcelImportResult {
  priceListId: number;
  totalRows: number;
  importedRows: number;
  matchedRows: number;
  unmatchedRows: number;
}
