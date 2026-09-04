export type MeasurementDimension =
  'COUNT' | 'WEIGHT' | 'LENGTH' | 'VOLUME' | 'CUSTOM';
export interface UnitOfMeasure {
  id: number;
  name: string;
  symbol: string;
  dimension: MeasurementDimension;
  baseConversionFactor: number;
  active: boolean;
}
export interface UnitOfMeasureRequest {
  name: string;
  symbol: string;
  dimension: MeasurementDimension;
  baseConversionFactor: number;
}
export interface ProductPresentation {
  id: number;
  name: string;
  unit: UnitOfMeasure;
  conversionFactor: number;
  saleEnabled: boolean;
  purchaseEnabled: boolean;
  defaultSale: boolean;
  barcode?: string | null;
  salePrice?: number | null;
  purchasePrice?: number | null;
  active: boolean;
}
export interface ProductPresentationRequest {
  name: string;
  unitId: number;
  conversionFactor: number;
  purchaseEnabled: boolean;
  saleEnabled: boolean;
  defaultSale: boolean;
  barcode?: string | null;
  salePrice?: number | null;
  purchasePrice?: number | null;
}
export interface VariantAttribute {
  id: number;
  name: string;
  active: boolean;
}
export interface VariantAttributeValue {
  id: number;
  attribute: VariantAttribute;
  value: string;
  active: boolean;
}
export interface ProductVariant {
  id: number;
  sku: string;
  barcode?: string | null;
  stock: number;
  salePrice?: number | null;
  purchasePrice?: number | null;
  attributes: Record<string, string>;
  active: boolean;
}
export interface ProductVariantRequest {
  sku: string;
  barcode?: string | null;
  stock: number;
  salePrice?: number | null;
  purchasePrice?: number | null;
  attributeValueIds: number[];
}
export interface ProductSaleConfiguration {
  productId: number;
  productName: string;
  unit: UnitOfMeasure | null;
  allowedUnits: UnitOfMeasure[];
  stock: number;
  fractionable: boolean;
  variantStockManaged: boolean;
  presentations: ProductPresentation[];
  variants: ProductVariant[];
}
export interface BaseUnitRequest {
  unitId: number;
  stock: number;
  minimumStock: number;
  fractionable: boolean;
  variantStockManaged: boolean;
}
export interface InventorySaleSelection {
  quantity: number;
  inputUnitId: number | null;
  presentationId: number | null;
  variantId: number | null;
  displayQuantity: string;
  unitPrice: number;
  available: number;
  baseQuantity: number;
  conversionFactor: number;
}
